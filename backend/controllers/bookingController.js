import crypto from 'crypto';
import homeModel from '../models/homeModel.js';
import bookingModel from '../models/bookingModel.js';
import AppError from '../utils/AppError.js';
import { parseDay, todayUTC, nightsBetween } from '../utils/helpers.js';
import { getRazorpay, isRazorpayConfigured } from '../config/razorpay.js';
import { hasConflict } from '../services/bookingService.js';

const HOLD_MINUTES = 15;
const MAX_NIGHTS = 90;

/**
 * POST /api/booking
 * body: { homeId, checkIn:'YYYY-MM-DD', checkOut:'YYYY-MM-DD', paymentMethod:'razorpay'|'pay_at_property' }
 * Price is always computed on the server from the home's current price.
 */
export const createBooking = async (req, res) => {
  const { homeId, checkIn, checkOut } = req.body;
  const paymentMethod = req.body.paymentMethod || 'razorpay';
  if (!['razorpay', 'pay_at_property'].includes(paymentMethod)) throw new AppError('Invalid payment method.', 400);

  const inDate = parseDay(checkIn, 'Check-in');
  const outDate = parseDay(checkOut, 'Check-out');
  if (inDate < todayUTC()) throw new AppError('Check-in date cannot be in the past.', 400);
  if (inDate >= outDate) throw new AppError('Check-out date must be after check-in date.', 400);
  const totalNights = nightsBetween(inDate, outDate);
  if (totalNights > MAX_NIGHTS) throw new AppError(`Maximum stay is ${MAX_NIGHTS} nights.`, 400);

  const home = await homeModel.findById(homeId);
  if (!home) throw new AppError('Listing not found.', 404);

  const online = paymentMethod === 'razorpay';
  if (online && !isRazorpayConfigured()) getRazorpay(); // throws a clear 503 before we hold any dates

  if (await hasConflict(home._id, inDate, outDate)) {
    throw new AppError('This home is already booked for the selected dates.', 409);
  }

  const booking = await bookingModel.create({
    home: home._id,
    user: req.user._id,
    houseName: home.houseName,
    location: home.location,
    photoUrl: home.photos[0] || '',
    pricePerNight: home.price,
    checkIn: inDate,
    checkOut: outDate,
    totalNights,
    totalPrice: totalNights * home.price,
    paymentMethod,
    status: online ? 'pending' : 'confirmed',
    paymentStatus: 'pending',
    expiresAt: online ? new Date(Date.now() + HOLD_MINUTES * 60 * 1000) : null,
  });

  // Two requests can pass the check above at the same moment. The older booking wins, the newer backs off.
  if (await hasConflict(home._id, inDate, outDate, { olderThanId: booking._id })) {
    await booking.deleteOne();
    throw new AppError('This home was just booked for those dates. Please pick other dates.', 409);
  }

  if (!online) return res.status(201).json({ success: true, message: 'Booking confirmed', booking });

  try {
    const order = await getRazorpay().orders.create({
      amount: booking.totalPrice * 100, // paise
      currency: 'INR',
      receipt: booking._id.toString(),
    });
    booking.razorpayOrderId = order.id;
    await booking.save();
    res.status(201).json({ success: true, booking, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    await booking.deleteOne(); // release the date hold
    console.error('Razorpay order failed:', err?.error?.description || err.message);
    throw new AppError('Could not start the payment. Please try again.', 502);
  }
};

const signatureMatches = (orderId, paymentId, signature) => {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/** POST /api/booking/verify - called by the frontend after Razorpay checkout succeeds. */
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
  if (!orderId || !paymentId || !signature) throw new AppError('Missing payment details.', 400);
  if (!process.env.RAZORPAY_KEY_SECRET) throw new AppError('Online payments are not configured.', 503);

  const booking = await bookingModel.findOne({ razorpayOrderId: orderId, user: req.user._id });
  if (!booking) throw new AppError('Booking not found for this payment.', 404);
  if (booking.paymentStatus === 'paid') return res.json({ success: true, message: 'Payment already verified', booking });

  if (!signatureMatches(orderId, paymentId, signature)) throw new AppError('Payment verification failed.', 400);

  // The payment is genuine. If our date hold expired and someone else took the dates meanwhile,
  // we cannot honour the stay: mark it for refund instead of double-booking.
  if (booking.status !== 'confirmed' && (await hasConflict(booking.home, booking.checkIn, booking.checkOut, { excludeId: booking._id }))) {
    booking.status = 'cancelled';
    booking.paymentStatus = 'refund_pending';
    booking.razorpayPaymentId = paymentId;
    await booking.save();
    throw new AppError('Your payment went through, but those dates were taken while you were paying. A refund will be issued.', 409);
  }

  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  booking.razorpayPaymentId = paymentId;
  booking.expiresAt = null;
  await booking.save();
  res.json({ success: true, message: 'Payment successful, booking confirmed', booking });
};

/** GET /api/booking/mine - bookings still in the checkout hold stage are hidden. */
export const myBookings = async (req, res) => {
  const bookings = await bookingModel.find({ user: req.user._id, status: { $ne: 'pending' } }).sort({ createdAt: -1 });
  res.json({ success: true, bookings });
};

/**
 * POST /api/booking/:id/cancel
 * - pending (checkout dismissed/failed) -> released, no money involved
 * - confirmed + paid online             -> cancelled, flagged refund_pending for the admin to refund
 * - confirmed + pay at property         -> cancelled
 */
export const cancelBooking = async (req, res) => {
  const booking = await bookingModel.findById(req.params.id);
  if (!booking || booking.user.toString() !== req.user._id.toString()) throw new AppError('Booking not found.', 404);

  if (booking.status === 'pending') {
    booking.status = 'cancelled';
    booking.paymentStatus = 'failed';
    booking.expiresAt = null;
    await booking.save();
    return res.json({ success: true, message: 'Booking released' });
  }
  if (booking.status !== 'confirmed') throw new AppError(`This booking is already ${booking.status}.`, 400);
  if (booking.checkIn < todayUTC()) throw new AppError('A stay that has already started cannot be cancelled.', 400);

  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refund_pending';
  await booking.save();
  res.json({
    success: true,
    message: booking.paymentStatus === 'refund_pending' ? 'Booking cancelled. Your refund will be processed shortly.' : 'Booking cancelled',
    booking,
  });
};
