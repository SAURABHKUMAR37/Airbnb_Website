import multer from 'multer';
import AppError from '../utils/AppError.js';

// Memory storage: files go straight from the request to Cloudinary, nothing is written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) return cb(null, true);
    cb(new AppError('Only JPG, PNG, WEBP, GIF or AVIF images are allowed.', 400));
  },
});

export const uploadImages = upload.array('images', 8);
