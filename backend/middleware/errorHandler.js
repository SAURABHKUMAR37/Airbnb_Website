import AppError from '../utils/AppError.js';

export const notFound = (req, _res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

export default function errorHandler(err, _req, res, _next) {
  let error = err;

  if (err.name === 'CastError') error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  else if (err.code === 11000) error = new AppError('That value is already in use.', 409);
  else if (err.name === 'ValidationError') {
    error = new AppError(Object.values(err.errors).map((e) => e.message).join('. '), 400);
  } else if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller.' : `Upload error: ${err.message}`;
    error = new AppError(msg, 400);
  } else if (err.type === 'entity.parse.failed') error = new AppError('Malformed JSON body.', 400);
  else if (err.message === 'Not allowed by CORS') error = new AppError('Origin not allowed.', 403);

  if (!error.isOperational) console.error('UNEXPECTED ERROR:', err);

  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    message: error.isOperational ? error.message : 'Something went wrong. Please try again.',
  });
}
