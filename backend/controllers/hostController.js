import homeModel from '../models/homeModel.js';
import bookingModel from '../models/bookingModel.js';
import AppError from '../utils/AppError.js';
import { createHome, updateHome, removeHome } from '../services/homeService.js';

const ownHome = async (req) => {
  const home = await homeModel.findById(req.params.id);
  if (!home) throw new AppError('Listing not found.', 404);
  if (!home.host || home.host.toString() !== req.user._id.toString()) {
    throw new AppError('You are not allowed to modify this listing.', 403);
  }
  return home;
};

/** Host dashboard: my homes, each with its (non-pending) bookings and the guest. */
export const myHomes = async (req, res) => {
  const homes = await homeModel.find({ host: req.user._id }).sort({ createdAt: -1 });
  const bookings = await bookingModel
    .find({ home: { $in: homes.map((h) => h._id) }, status: { $in: ['confirmed', 'completed'] } })
    .populate('user', 'name email')
    .sort({ checkIn: -1 });

  const byHome = new Map();
  bookings.forEach((b) => {
    const key = b.home.toString();
    if (!byHome.has(key)) byHome.set(key, []);
    byHome.get(key).push(b);
  });
  const data = homes.map((h) => ({ ...h.toJSON(), bookings: byHome.get(h._id.toString()) || [] }));
  res.json({ success: true, homes: data });
};

export const getMyHome = async (req, res) => res.json({ success: true, home: await ownHome(req) });

export const addHome = async (req, res) => {
  const home = await createHome(req, req.user._id);
  res.status(201).json({ success: true, message: 'Home added', home });
};

export const editHome = async (req, res) => {
  const home = await ownHome(req);
  await updateHome(home, req);
  res.json({ success: true, message: 'Home updated', home });
};

export const deleteHome = async (req, res) => {
  const home = await ownHome(req);
  await removeHome(home);
  res.json({ success: true, message: 'Home deleted' });
};
