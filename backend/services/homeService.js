import homeModel from '../models/homeModel.js';
import bookingModel from '../models/bookingModel.js';
import favouriteModel from '../models/favouriteModel.js';
import reviewModel from '../models/reviewModel.js';
import { uploadBuffer, deleteByUrl } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

const MAX_PHOTOS = 10;

const parseExisting = (raw) => {
  if (!raw) return [];
  let list = raw;
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw);
    } catch {
      list = [raw];
    }
  }
  if (!Array.isArray(list)) list = [list];
  return list.filter((u) => typeof u === 'string' && /^https?:\/\//.test(u));
};

/** Kept (existing) photo URLs + freshly uploaded Cloudinary URLs, validated. */
export const buildPhotos = async (req) => {
  const kept = parseExisting(req.body.existingImages);
  const files = req.files || [];
  if (kept.length + files.length === 0) throw new AppError('Please add at least one photo.', 400);
  if (kept.length + files.length > MAX_PHOTOS) throw new AppError(`A home can have at most ${MAX_PHOTOS} photos.`, 400);
  const uploaded = await Promise.all(files.map((f) => uploadBuffer(f.buffer)));
  return [...kept, ...uploaded];
};

const pickFields = (body) => ({
  houseName: body.houseName,
  location: body.location,
  price: Number(body.price),
  description: body.description ?? '',
});

export const createHome = async (req, hostId = null) => {
  const photos = await buildPhotos(req);
  return homeModel.create({ ...pickFields(req.body), photos, host: hostId });
};

export const updateHome = async (home, req) => {
  const photos = await buildPhotos(req);
  const removed = home.photos.filter((p) => !photos.includes(p));
  Object.assign(home, pickFields(req.body), { photos });
  await home.save();
  removed.forEach(deleteByUrl); // best effort, not awaited
  return home;
};

/** Delete a home plus everything that hangs off it. */
export const removeHome = async (home) => {
  await Promise.all([
    bookingModel.deleteMany({ home: home._id }),
    reviewModel.deleteMany({ home: home._id }),
    favouriteModel.deleteMany({ home: home._id }),
  ]);
  await home.deleteOne();
  home.photos.forEach(deleteByUrl);
};
