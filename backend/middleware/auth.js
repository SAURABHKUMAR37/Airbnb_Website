import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';

/** Token is read from the `token` header (same as the ecommerce project) or `Authorization: Bearer`. */
export const getToken = (req) => {
  if (req.headers.token) return req.headers.token;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Your session is invalid or has expired. Please log in again.', 401);
  }
};

/** Requires a logged-in normal user. Sets req.user. */
export const authUser = async (req, _res, next) => {
  const token = getToken(req);
  if (!token) throw new AppError('Not authorized. Please log in.', 401);
  const decoded = verify(token);
  if (decoded.role === 'admin' || !decoded.id) throw new AppError('Not authorized. Please log in.', 401);
  const user = await userModel.findById(decoded.id);
  if (!user) throw new AppError('This account no longer exists.', 401);
  req.user = user;
  next();
};

/** Requires the admin token issued by POST /api/user/admin. */
export const adminAuth = (req, _res, next) => {
  const token = getToken(req);
  if (!token) throw new AppError('Not authorized. Admin login required.', 401);
  const decoded = verify(token);
  if (decoded.role !== 'admin' || decoded.email !== process.env.ADMIN_EMAIL) {
    throw new AppError('Not authorized. Admin login required.', 401);
  }
  next();
};
