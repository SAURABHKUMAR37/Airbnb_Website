import bookingModel, { activeBookingFilter } from '../models/bookingModel.js';

/**
 * Is there an active booking overlapping [checkIn, checkOut) for this home?
 * excludeId   - ignore this booking (used when re-checking an existing one)
 * olderThanId - only consider bookings created before this one (race-condition tie-break)
 */
export const hasConflict = (homeId, checkIn, checkOut, { excludeId, olderThanId } = {}) => {
  const filter = {
    home: homeId,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    ...activeBookingFilter(),
  };
  if (excludeId) filter._id = { $ne: excludeId };
  if (olderThanId) filter._id = { $lt: olderThanId };
  return bookingModel.exists(filter);
};
