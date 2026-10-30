import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { fmtDate, inr } from '../config'

const payTone = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  refund_pending: 'bg-orange-100 text-orange-700',
  refunded: 'bg-blue-100 text-blue-700',
  failed: 'bg-gray-100 text-gray-500',
}

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [busy, setBusy] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/bookings')
      setBookings(data.bookings)
    } catch (e) {
      toast.error(errMsg(e))
    }
  }, [])
  useEffect(() => { fetchAll() }, [fetchAll])

  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status })
      toast.success('Booking updated')
      fetchAll()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  const refund = async (b) => {
    if (!window.confirm(`Refund ${inr(b.totalPrice)} to ${b.user?.name || 'the guest'} via Razorpay?`)) return
    setBusy(b._id)
    try {
      await api.post(`/admin/bookings/${b._id}/refund`)
      toast.success('Refund issued')
      fetchAll()
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy('')
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Bookings ({bookings.length})</h3>
      {bookings.length === 0 && <p className="text-gray-400">No bookings yet.</p>}
      {bookings.map((b) => (
        <div key={b._id} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1.5fr_1.5fr] gap-3 items-start border-2 border-gray-200 bg-white p-5 my-3 text-xs sm:text-sm text-gray-700 rounded">
          <div>
            <p className="font-semibold text-gray-900 text-base">{b.houseName}</p>
            <p>📍 {b.location}</p>
            <p className="mt-2">👤 {b.user?.name || 'Deleted user'}</p>
            <p className="text-gray-500">{b.user?.email}</p>
          </div>
          <div>
            <p>Check-in: <b>{fmtDate(b.checkIn)}</b></p>
            <p>Check-out: <b>{fmtDate(b.checkOut)}</b></p>
            <p>{b.totalNights} nights × {inr(b.pricePerNight)}</p>
            <p className="mt-1">Booked: {fmtDate(b.createdAt)}</p>
          </div>
          <div>
            <p className="text-base font-semibold">{inr(b.totalPrice)}</p>
            <p className="mt-1">Method: {b.paymentMethod === 'razorpay' ? 'Razorpay' : 'Pay at property'}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${payTone[b.paymentStatus]}`}>{b.paymentStatus.replace('_', ' ')}</span>
            {b.razorpayPaymentId && <p className="text-xs text-gray-400 mt-1 break-all">{b.razorpayPaymentId}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <select value={b.status} onChange={(e) => setStatus(b._id, e.target.value)} className="p-2 font-semibold">
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {b.paymentStatus === 'refund_pending' && (
              <button disabled={busy === b._id} onClick={() => refund(b)} className="bg-orange-500 text-white py-2 rounded disabled:opacity-60">
                {busy === b._id ? 'Refunding...' : 'Issue refund'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
export default Bookings
