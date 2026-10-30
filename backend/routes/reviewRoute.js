import express from 'express';
import { authUser } from '../middleware/auth.js';
import { listReviews, addReview, deleteReview } from '../controllers/reviewController.js';

const reviewRouter = express.Router();
reviewRouter.get('/home/:homeId', listReviews);
reviewRouter.post('/home/:homeId', authUser, addReview);
reviewRouter.delete('/:reviewId', authUser, deleteReview);
export default reviewRouter;
