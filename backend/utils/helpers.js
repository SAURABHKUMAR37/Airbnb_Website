import AppError from './AppError.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Escape user text before putting it inside a RegExp. */
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Parse 'YYYY-MM-DD' into a UTC-midnight Date. Throws AppError on bad input. */
export const parseDay = (value, label) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(`${label} must be a date in YYYY-MM-DD format.`, 400);
  }
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new AppError(`${label} is not a valid date.`, 400);
  }
  return d;
};

export const todayUTC = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
};

export const nightsBetween = (checkIn, checkOut) => Math.round((checkOut - checkIn) / DAY_MS);

export const getPagination = (query, defaultLimit = 12, maxLimit = 50) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};
