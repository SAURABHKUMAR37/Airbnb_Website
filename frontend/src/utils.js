export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const pad = (n) => String(n).padStart(2, '0')
export const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
export const todayISO = () => {
  const n = new Date()
  return toISO(n.getFullYear(), n.getMonth(), n.getDate())
}

export const nightsBetween = (a, b) =>
  Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000)

/** Dates come from the API as UTC-midnight timestamps, so format them in UTC. */
export const fmtDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** do [ci, co) and any booked range overlap? (check-out day is free) */
export const overlapsBooked = (ci, co, ranges) => ranges.some((r) => ci < r.checkOut && co > r.checkIn)

export const coverPhoto = (home) => home?.photos?.[0] || home?.photoUrl || ''
