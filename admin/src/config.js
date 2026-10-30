export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
export const currency = '₹'
export const inr = (n) => `${currency}${Number(n || 0).toLocaleString('en-IN')}`
export const fmtDate = (v) =>
  new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
