import homeModel from '../models/homeModel.js';
import bookingModel, { activeBookingFilter } from '../models/bookingModel.js';
import AppError from '../utils/AppError.js';
import { getPagination } from '../utils/helpers.js';

const SORTS = {
  rating: { rating: -1, createdAt: -1 },
  priceLow: { price: 1 },
  priceHigh: { price: -1 },
};

/** GET /api/home?title&location&minPrice&maxPrice&sort&page&limit */
export const listHomes = async (req, res) => {
  const query = homeModel.buildSearchQuery(req.query);
  const sort = SORTS[String(req.query.sort || '')] || { createdAt: -1 };
  const { page, limit, skip } = getPagination(req.query);

  const [homes, total] = await Promise.all([
    homeModel.find(query).sort(sort).skip(skip).limit(limit),
    homeModel.countDocuments(query),
  ]);
  res.json({ success: true, homes, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
};

export const getHome = async (req, res) => {
  const home = await homeModel.findById(req.params.id).populate('host', 'name');
  if (!home) throw new AppError('Listing not found.', 404);
  res.json({ success: true, home });
};

/** Date ranges that can't be booked. check-out day itself is free. */
export const getBookedDates = async (req, res) => {
  const bookings = await bookingModel
    .find({ home: req.params.id, ...activeBookingFilter() })
    .select('checkIn checkOut');
  const ranges = bookings.map((b) => ({
    checkIn: b.checkIn.toISOString().slice(0, 10),
    checkOut: b.checkOut.toISOString().slice(0, 10),
  }));
  res.json({ success: true, ranges });
};
