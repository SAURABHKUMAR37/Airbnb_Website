import Razorpay from 'razorpay';
import AppError from '../utils/AppError.js';

let instance;

export const isRazorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/** Created lazily so the server still boots (and pay-at-property works) without Razorpay keys. */
export const getRazorpay = () => {
  if (!isRazorpayConfigured()) {
    throw new AppError('Online payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.', 503);
  }
  if (!instance) {
    instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  }
  return instance;
};
