import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import userModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/sendEmail.js';

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const str = (v) => (typeof v === 'string' ? v : '');

export const registerUser = async (req, res) => {
  const name = str(req.body.name).trim();
  const email = str(req.body.email).trim().toLowerCase();
  const password = str(req.body.password);

  if (!name || !email || !password) throw new AppError('Name, email and password are all required.', 400);
  if (!validator.isEmail(email)) throw new AppError('Please enter a valid email.', 400);
  if (password.length < 8) throw new AppError('Password must be at least 8 characters.', 400);
  if (await userModel.findOne({ email })) throw new AppError('Email already registered. Please log in.', 409);

  const user = await userModel.create({ name, email, password });
  res.status(201).json({ success: true, token: createToken(user._id), user });
};

export const loginUser = async (req, res) => {
  const email = str(req.body.email).trim().toLowerCase();
  const password = str(req.body.password);
  if (!email || !password) throw new AppError('Please provide both email and password.', 400);

  const user = await userModel.findOne({ email }).select('+password');
  const ok = user ? await user.comparePassword(password) : false;
  if (!ok) throw new AppError('Invalid email or password.', 401);

  res.json({ success: true, token: createToken(user._id), user });
};

export const getMe = (req, res) => res.json({ success: true, user: req.user });

/** Admin credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD), like the ecommerce project. */
export const adminLogin = (req, res) => {
  const email = str(req.body.email);
  const password = str(req.body.password);
  const safeEq = (a, b) => {
    const ha = crypto.createHash('sha256').update(a).digest();
    const hb = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(ha, hb);
  };
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new AppError('Admin login is not configured on the server.', 503);
  }
  if (!safeEq(email, process.env.ADMIN_EMAIL) || !safeEq(password, process.env.ADMIN_PASSWORD)) {
    throw new AppError('Invalid credentials.', 401);
  }
  const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ success: true, token });
};

const GENERIC_RESET_MSG = 'If an account exists for that email, a reset link has been sent.';
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

export const forgotPassword = async (req, res) => {
  const email = str(req.body.email).trim().toLowerCase();
  const user = await userModel.findOne({ email });
  // Same response whether or not the account exists -> no email enumeration.
  if (!user) return res.json({ success: true, message: GENERIC_RESET_MSG });

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = hashToken(rawToken);
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${base}/reset-password/${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Airbnb Clone - Password reset link',
      devFallback: `Reset link for ${user.email}: ${resetLink}`,
      html: `<h2>Password reset request</h2>
        <p>Click below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset password</a>
        <p style="color:gray;margin-top:16px;">If you didn't request this, you can ignore this email.</p>`,
    });
  } catch (err) {
    console.error('Reset email failed:', err.message);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Could not send reset email. Please try again later.', 500);
  }
  res.json({ success: true, message: GENERIC_RESET_MSG });
};

const findByResetToken = (token) =>
  userModel.findOne({ resetToken: hashToken(str(token)), resetTokenExpiry: { $gt: new Date() } });

export const verifyResetToken = async (req, res) => {
  const user = await findByResetToken(req.params.token);
  if (!user) throw new AppError('Reset link is expired or invalid.', 400);
  res.json({ success: true });
};

export const resetPassword = async (req, res) => {
  const user = await findByResetToken(req.params.token);
  if (!user) throw new AppError('Reset link is expired or invalid.', 400);
  const password = str(req.body.password);
  if (password.length < 8) throw new AppError('Password must be at least 8 characters.', 400);

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  res.json({ success: true, token: createToken(user._id), user });
};
