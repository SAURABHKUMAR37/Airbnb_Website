import { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'
import Spinner from '../components/Spinner'
import { fmtDate, inr, todayISO } from '../utils'

const statusStyle = {
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-200 text-gray-600',
}
const payLabel = {
  paid: ['Paid online', 'bg-green-50 text-green-700'],
  pending: ['Pay at property', 'bg-yellow-50 text-yellow-700'],
  refund_pending: ['Refund in progress', 'bg-orange-50 text-orange-700'],
  refunded: ['Refunded', 'bg-blue-50 text-blue-700'],
  failed: ['Payment not completed', 'bg-gray-100 text-gray-500'],
}

const Bookings = () => {
  const { user } = useContext(AppContext)
  const [bookings, setBookings] = useState(null)

  const load = useCallback(() => {
    api.get('/booking/mine').then((r) => setBookings(r.data.bookings)).catch((e) => { toast.error(errMsg(e)); setBookings([]) })
  }, [])
  useEffect(load, [load])

  const cancel = async (b) => {
    const msg = b.paymentStatus === 'paid' ? 'Cancel this booking? Your online payment will be refunded.' : 'Cancel this booking?'
    if (!window.confirm(msg)) return
    try {
      const { data } = await api.post(`/booking/${b._id}/cancel`)
      toast.success(data.message)
      load()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  if (!bookings) return <Spinner />
  const today = todayISO()

  return (
    <main className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">My Bookings</h2>
        {user && <p className="text-lg text-gray-500">Welcome back, <span className="font-semibold text-red-500">{user.name}</span> 👋</p>}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
          <div className="text-7xl mb-5">🏠</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Bookings Yet</h3>
          <p className="text-gray-500 mb-8">Start exploring beautiful homes and make your first booking.</p>
          <Link to="/homes" className="inline-block bg-red-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:bg-red-600 transition">Explore Homes</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {bookings.map((b) => {
            const [pLabel, pStyle] = payLabel[b.paymentStatus] || payLabel.pending
            const canCancel = b.status === 'confirmed' && b.checkIn.slice(0, 10) >= today
            return (
              <div key={b._id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-80 flex-shrink-0">
                    <img src={b.photoUrl} alt={b.houseName} className={`w-full h-56 md:h-full object-cover ${b.status === 'cancelled' ? 'grayscale' : ''}`} />
                  </div>
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {b.home ? <Link to={`/homes/${b.home}`} className="hover:text-red-500">{b.houseName}</Link> : b.houseName}
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${pStyle}`}>{pLabel}</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-lg mb-6">📍 {b.location}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-4"><p className="text-gray-400 text-sm mb-1">Check In</p><p className="font-semibold text-gray-800">{fmtDate(b.checkIn)}</p></div>
                        <div className="bg-gray-50 rounded-2xl p-4"><p className="text-gray-400 text-sm mb-1">Check Out</p><p className="font-semibold text-gray-800">{fmtDate(b.checkOut)}</p></div>
                        <div className="bg-gray-50 rounded-2xl p-4"><p className="text-gray-400 text-sm mb-1">Total Nights</p><p className="font-semibold text-gray-800">{b.totalNights}</p></div>
                        <div className="bg-red-50 rounded-2xl p-4"><p className="text-red-400 text-sm mb-1">Total Price</p><p className="font-bold text-red-500 text-xl">{inr(b.totalPrice)}</p></div>
                      </div>
                    </div>
                    {canCancel && (
                      <button onClick={() => cancel(b)} className="mt-8 self-start bg-red-500 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:bg-red-600 transition">Cancel Booking</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
export default Bookings
