import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'home', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    rating: { type: Number, required: [true, 'Rating is required'], min: [1, 'Rating must be at least 1'], max: [5, 'Rating cannot exceed 5'] },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

reviewSchema.index({ home: 1, user: 1 }, { unique: true }); // one review per user per home
reviewSchema.index({ home: 1, createdAt: -1 });

export default mongoose.models.review || mongoose.model('review', reviewSchema);
