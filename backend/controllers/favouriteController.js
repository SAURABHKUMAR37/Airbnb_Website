import favouriteModel from '../models/favouriteModel.js';
import homeModel from '../models/homeModel.js';
import AppError from '../utils/AppError.js';

export const listFavourites = async (req, res) => {
  const favs = await favouriteModel.find({ user: req.user._id }).populate('home').sort({ createdAt: -1 });
  const homes = favs.map((f) => f.home).filter(Boolean);
  res.json({ success: true, homes, ids: homes.map((h) => h._id.toString()) });
};

export const addFavourite = async (req, res) => {
  const { homeId } = req.params;
  if (!(await homeModel.exists({ _id: homeId }))) throw new AppError('Listing not found.', 404);
  await favouriteModel.updateOne({ user: req.user._id, home: homeId }, { $setOnInsert: { user: req.user._id, home: homeId } }, { upsert: true });
  res.json({ success: true, message: 'Added to favourites' });
};

export const removeFavourite = async (req, res) => {
  await favouriteModel.deleteOne({ user: req.user._id, home: req.params.homeId });
  res.json({ success: true, message: 'Removed from favourites' });
};
