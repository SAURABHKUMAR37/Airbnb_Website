import express from 'express';
import rateLimit from 'express-rate-limit';
import { authUser } from '../middleware/auth.js';
import {
  registerUser, loginUser, adminLogin, getMe,
  forgotPassword, verifyResetToken, resetPassword,
} from '../controllers/userController.js';

const userRouter = express.Router();

// Slow down brute-force / credential-stuffing on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});

userRouter.post('/register', authLimiter, registerUser);
userRouter.post('/login', authLimiter, loginUser);
userRouter.post('/admin', authLimiter, adminLogin);
userRouter.get('/me', authUser, getMe);
userRouter.post('/forgot-password', authLimiter, forgotPassword);
userRouter.get('/reset-password/:token', verifyResetToken);
userRouter.post('/reset-password/:token', authLimiter, resetPassword);

export default userRouter;
