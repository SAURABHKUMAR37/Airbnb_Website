import userModel from '../models/userModel.js';
import homeModel from '../models/homeModel.js';
import bookingModel from '../models/bookingModel.js';
import reviewModel from '../models/reviewModel.js';
import favouriteModel from '../models/favouriteModel.js';
import AppError from '../utils/AppError.js';
import { getRazorpay } from '../config/razorpay.js';
import { createHome, updateHome, removeHome } from '../services/homeService.js';
import { recalculateHomeRating } from '../services/reviewService.js';
import { hasConflict } from '../services/bookingService.js';

/* ----------------------------- dashboard ----------------------------- */
export const stats = async (_req, res) => {
  const [users, homes, bookings, reviews, paid, recent, refundsPending] = await Promise.all([
    userModel.countDocuments(),
    homeModel.countDocuments(),
    bookingModel.countDocuments({ status: { $ne: 'pending' } }),
    reviewModel.countDocuments(),
    bookingModel.find({ paymentStatus: 'paid', status: { $in: ['confirmed', 'completed'] } }).select('totalPrice'),
    bookingModel.find({ status: { $ne: 'pending' } }).sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    bookingModel.countDocuments({ paymentStatus: 'refund_pending' }),
  ]);
  const revenue = paid.reduce((sum, b) => sum + b.totalPrice, 0);
  res.json({ success: true, stats: { users, homes, bookings, reviews, revenue, refundsPending }, recent });
};

/* ------------------------------- homes ------------------------------- */
export const listHomes = async (_req, res) => {
  const homes = await homeModel.find().sort({ createdAt: -1 }).populate('host', 'name email');
  res.json({ success: true, homes });
};

export const getHome = async (req, res) => {
  const home = await homeModel.findById(req.params.id);
  if (!home) throw new AppError('Listing not found.', 404);
  res.json({ success: true, home });
};

export const addHome = async (req, res) => {
  const home = await createHome(req, null);
  res.status(201).json({ success: true, message: 'Home added', home });
};

export const editHome = async (req, res) => {
  const home = await homeModel.findById(req.params.id);
  if (!home) throw new AppError('Listing not found.', 404);
  await updateHome(home, req);
  res.json({ success: true, message: 'Home updated', home });
};

export const deleteHome = async (req, res) => {
  const home = await homeModel.findById(req.params.id);
  if (!home) throw new AppError('Listing not found.', 404);
  await removeHome(home);
  res.json({ success: true, message: 'Home deleted' });
};

/* ----------------------------- bookings ------------------------------ */
export const listBookings = async (_req, res) => {
  const bookings = await bookingModel
    .find({ status: { $ne: 'pending' } })
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
  res.json({ success: true, bookings });
};

export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) throw new AppError('Invalid status.', 400);
  const booking = await bookingModel.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found.', 404);

  if (status === 'confirmed' && booking.status !== 'confirmed') {
    if (await hasConflict(booking.home, booking.checkIn, booking.checkOut, { excludeId: booking._id })) {
      throw new AppError('Those dates are now booked by someone else.', 409);
    }
  }
  if (status === 'cancelled' && booking.paymentStatus === 'paid') booking.paymentStatus = 'refund_pending';
  if (status === 'completed' && booking.paymentMethod === 'pay_at_property') booking.paymentStatus = 'paid';
  booking.status = status;
  booking.expiresAt = null;
  await booking.save();
  res.json({ success: true, message: 'Booking updated', booking });
};

/** Refund the full amount through Razorpay for a cancelled, paid booking. */
export const refundBooking = async (req, res) => {
  const booking = await bookingModel.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found.', 404);
  if (booking.paymentStatus !== 'refund_pending') throw new AppError('This booking has no pending refund.', 400);
  if (!booking.razorpayPaymentId) throw new AppError('No Razorpay payment is linked to this booking.', 400);

  try {
    const refund = await getRazorpay().payments.refund(booking.razorpayPaymentId, {
      amount: booking.totalPrice * 100,
      notes: { bookingId: booking._id.toString() },
    });
    booking.refundId = refund.id;
    booking.paymentStatus = 'refunded';
    await booking.save();
    res.json({ success: true, message: 'Refund issued', booking });
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error('Refund failed:', err?.error?.description || err.message);
    throw new AppError(`Refund failed: ${err?.error?.description || err.message}`, 502);
  }
};

/* ------------------------------- users ------------------------------- */
export const listUsers = async (_req, res) => {
  const [users, homes, bookings] = await Promise.all([
    userModel.find().sort({ createdAt: -1 }),
    homeModel.find().select('host'),
    bookingModel.find({ status: { $ne: 'pending' } }).select('user'),
  ]);
  const count = (list, key) => list.reduce((m, x) => (x[key] ? m.set(x[key].toString(), (m.get(x[key].toString()) || 0) + 1) : m), new Map());
  const homesBy = count(homes, 'host');
  const bookingsBy = count(bookings, 'user');
  res.json({
    success: true,
    users: users.map((u) => ({ ...u.toJSON(), homes: homesBy.get(u._id.toString()) || 0, bookings: bookingsBy.get(u._id.toString()) || 0 })),
  });
};

export const deleteUser = async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);

  const hosted = await homeModel.find({ host: user._id });
  for (const home of hosted) await removeHome(home);

  const reviewed = await reviewModel.find({ user: user._id }).select('home');
  await Promise.all([
    bookingModel.deleteMany({ user: user._id }),
    favouriteModel.deleteMany({ user: user._id }),
    reviewModel.deleteMany({ user: user._id }),
  ]);
  for (const homeId of new Set(reviewed.map((r) => r.home.toString()))) await recalculateHomeRating(homeId);
  await user.deleteOne();
  res.json({ success: true, message: 'User and related data deleted' });
};

/* ------------------------------ reviews ------------------------------ */
export const listReviews = async (_req, res) => {
  const reviews = await reviewModel.find().sort({ createdAt: -1 }).populate('user', 'name email').populate('home', 'houseName');
  res.json({ success: true, reviews });
};

export const deleteReview = async (req, res) => {
  const review = await reviewModel.findById(req.params.id);
  if (!review) throw new AppError('Review not found.', 404);
  await review.deleteOne();
  await recalculateHomeRating(review.home);
  res.json({ success: true, message: 'Review deleted' });
};
