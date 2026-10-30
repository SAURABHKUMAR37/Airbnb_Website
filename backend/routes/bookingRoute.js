import express from 'express';
import { authUser } from '../middleware/auth.js';
import { createBooking, verifyPayment, myBookings, cancelBooking } from '../controllers/bookingController.js';

const bookingRouter = express.Router();
bookingRouter.use(authUser);
bookingRouter.post('/', createBooking);
bookingRouter.post('/verify', verifyPayment);
bookingRouter.get('/mine', myBookings);
bookingRouter.post('/:id/cancel', cancelBooking);
export default bookingRouter;
