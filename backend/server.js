import 'dotenv/config';
import { pathToFileURL } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/mongodb.js';
import { connectCloudinary } from './config/cloudinary.js';
import sanitize from './middleware/sanitize.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';
import userRouter from './routes/userRoute.js';
import homeRouter from './routes/homeRoute.js';
import hostRouter from './routes/hostRoute.js';
import bookingRouter from './routes/bookingRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import favouriteRouter from './routes/favouriteRoute.js';
import adminRouter from './routes/adminRoute.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 4000;

app.set('trust proxy', 1);
connectCloudinary();

const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000, standardHeaders: true, legacyHeaders: false }));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50kb' }));
app.use(sanitize);

// api endpoints
app.use('/api/user', userRouter);
app.use('/api/home', homeRouter);
app.use('/api/host', hostRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/review', reviewRouter);
app.use('/api/favourite', favouriteRouter);
app.use('/api/admin', adminRouter);

app.get('/', (_req, res) => res.send('API WORKING'));

app.use(notFound);
app.use(errorHandler);

export default app;

// Only start listening when run directly (keeps the app importable for tests)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  connectDB()
    .then(() => app.listen(port, () => console.log(`Server started on http://localhost:${port}`)))
    .catch((err) => {
      console.error('Failed to connect to MongoDB. Server not started.', err.message);
      process.exit(1);
    });
}
