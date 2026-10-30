import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL is not defined. Check backend/.env');
  mongoose.set('strictQuery', true);
  mongoose.connection.on('connected', () => console.log('DB CONNECTED'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
  await mongoose.connect(process.env.MONGODB_URL, { dbName: process.env.DB_NAME || 'AIRBNB', serverSelectionTimeoutMS: 5000 });
};

export default connectDB;
