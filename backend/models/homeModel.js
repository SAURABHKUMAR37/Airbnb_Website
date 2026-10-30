import mongoose from 'mongoose';
import { escapeRegex } from '../utils/helpers.js';

const homeSchema = new mongoose.Schema(
  {
    houseName: { type: String, required: [true, 'House name is required'], trim: true, minlength: 3, maxlength: 100 },
    location: { type: String, required: [true, 'Location is required'], trim: true, maxlength: 120 },
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be greater than 0'], max: 1000000 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    photos: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, min: 0, default: 0 },
    // null host = listing created from the admin panel
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

homeSchema.index({ location: 1 });
homeSchema.index({ price: 1 });
homeSchema.index({ host: 1 });

homeSchema.virtual('photoUrl').get(function () {
  return this.photos?.[0] || '';
});

homeSchema.virtual('bookings', { ref: 'booking', localField: '_id', foreignField: 'home' });

homeSchema.statics.buildSearchQuery = function ({ location, title, minPrice, maxPrice } = {}) {
  const query = {};
  const loc = String(location ?? '').trim();
  const name = String(title ?? '').trim();
  if (loc) query.location = { $regex: escapeRegex(loc), $options: 'i' };
  if (name) query.houseName = { $regex: escapeRegex(name), $options: 'i' };
  const min = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
  const max = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;
  if ((min !== null && !Number.isNaN(min)) || (max !== null && !Number.isNaN(max))) {
    query.price = {};
    if (min !== null && !Number.isNaN(min)) query.price.$gte = min;
    if (max !== null && !Number.isNaN(max)) query.price.$lte = max;
  }
  return query;
};

export default mongoose.models.home || mongoose.model('home', homeSchema);
