import homeModel from '../models/homeModel.js';
import reviewModel from '../models/reviewModel.js';
import AppError from '../utils/AppError.js';
import { recalculateHomeRating } from '../services/reviewService.js';

export const listReviews = async (req, res) => {
  const reviews = await reviewModel.find({ home: req.params.homeId }).populate('user', 'name').sort({ createdAt: -1 });
  res.json({ success: true, reviews });
};

export const addReview = async (req, res) => {
  const { homeId } = req.params;
  const rating = Number(req.body.rating);
  const comment = typeof req.body.comment === 'string' ? req.body.comment : '';

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new AppError('Rating must be a whole number from 1 to 5.', 400);
  if (!(await homeModel.exists({ _id: homeId }))) throw new AppError('Listing not found.', 404);
  if (await reviewModel.exists({ home: homeId, user: req.user._id })) {
    throw new AppError('You have already reviewed this home.', 409);
  }

  await reviewModel.create({ home: homeId, user: req.user._id, rating, comment });
  const stats = await recalculateHomeRating(homeId);
  res.status(201).json({ success: true, message: 'Review added', ...stats });
};

export const deleteReview = async (req, res) => {
  const review = await reviewModel.findById(req.params.reviewId);
  if (!review) throw new AppError('Review not found.', 404);
  if (review.user.toString() !== req.user._id.toString()) throw new AppError('You can only delete your own review.', 403);
  await review.deleteOne();
  await recalculateHomeRating(review.home);
  res.json({ success: true, message: 'Review deleted' });
};
