import { v2 as cloudinary } from 'cloudinary';
import AppError from '../utils/AppError.js';

export const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
};

export const isCloudinaryConfigured = () =>
  Boolean(process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_SECRET_KEY);

/** Upload an in-memory image buffer (from multer); resolves with the secure URL. */
export const uploadBuffer = (buffer, folder = 'airbnb/homes') => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Image uploads are not configured. Set the CLOUDINARY_* variables in backend/.env.', 503);
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) =>
      err ? reject(new AppError(`Image upload failed: ${err.message}`, 502)) : resolve(result.secure_url)
    );
    stream.end(buffer);
  });
};

/** Best-effort delete by URL. Non-Cloudinary URLs (e.g. seed data) are ignored. */
export const deleteByUrl = async (url) => {
  try {
    if (!isCloudinaryConfigured() || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    if (match) await cloudinary.uploader.destroy(match[1]);
  } catch (err) {
    console.warn('Cloudinary delete failed:', err.message);
  }
};

export default cloudinary;
