import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'home', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    // snapshot so a booking still reads correctly if the home is edited/removed later
    houseName: { type: String, required: true },
    location: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    pricePerNight: { type: Number, required: true, min: 1 },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalNights: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 1 },

    // pending = date hold while the Razorpay checkout is open (expires)
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    paymentMethod: { type: String, enum: ['razorpay', 'pay_at_property'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refund_pending', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    refundId: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ home: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ razorpayOrderId: 1 });

/** Filter for bookings that currently block the calendar (confirmed, or an unexpired payment hold). */
export const activeBookingFilter = () => ({
  $or: [{ status: 'confirmed' }, { status: 'pending', expiresAt: { $gt: new Date() } }],
});

export default mongoose.models.booking || mongoose.model('booking', bookingSchema);
