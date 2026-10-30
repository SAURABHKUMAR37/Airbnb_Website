import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import * as admin from '../controllers/adminController.js';

const adminRouter = express.Router();
adminRouter.use(adminAuth);

adminRouter.get('/stats', admin.stats);

adminRouter.get('/homes', admin.listHomes);
adminRouter.post('/homes', uploadImages, admin.addHome);
adminRouter.get('/homes/:id', admin.getHome);
adminRouter.put('/homes/:id', uploadImages, admin.editHome);
adminRouter.delete('/homes/:id', admin.deleteHome);

adminRouter.get('/bookings', admin.listBookings);
adminRouter.put('/bookings/:id/status', admin.updateBookingStatus);
adminRouter.post('/bookings/:id/refund', admin.refundBooking);

adminRouter.get('/users', admin.listUsers);
adminRouter.delete('/users/:id', admin.deleteUser);

adminRouter.get('/reviews', admin.listReviews);
adminRouter.delete('/reviews/:id', admin.deleteReview);

export default adminRouter;
