import reviewModel from '../models/reviewModel.js';
import homeModel from '../models/homeModel.js';

/** Recalculate a home's average rating + review count from its reviews. */
export const recalculateHomeRating = async (homeId) => {
  const reviews = await reviewModel.find({ home: homeId }).select('rating');
  const numReviews = reviews.length;
  const rating = numReviews ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / numReviews) * 10) / 10 : 0;
  await homeModel.findByIdAndUpdate(homeId, { rating, numReviews });
  return { rating, numReviews };
};
