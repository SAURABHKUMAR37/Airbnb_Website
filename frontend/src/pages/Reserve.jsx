import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'
import Calendar from '../components/Calendar'
import Spinner from '../components/Spinner'
import { inr, nightsBetween, overlapsBooked, todayISO } from '../utils'

const dateInput = 'w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400'

const Reserve = () => {
  const { id } = useParams()
  const { user, navigate } = useContext(AppContext)
  const [home, setHome] = useState(null)
  const [ranges, setRanges] = useState([])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [method, setMethod] = useState('razorpay')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const settled = useRef(false)
  const today = todayISO()

  useEffect(() => {
    Promise.all([api.get(`/home/${id}`), api.get(`/home/${id}/booked-dates`)])
      .then(([h, b]) => { setHome(h.data.home); setRanges(b.data.ranges) })
      .catch((e) => { toast.error(errMsg(e)); navigate('/homes') })
  }, [id, navigate])

  const nights = checkIn && checkOut && checkOut > checkIn ? nightsBetween(checkIn, checkOut) : 0
  const total = nights * (home?.price || 0)

  /** calendar click: first click = check-in, second = check-out, third starts over */
  const pick = (iso) => {
    setError('')
    if (!checkIn || checkOut || iso <= checkIn) { setCheckIn(iso); setCheckOut(''); return }
    if (overlapsBooked(checkIn, iso, ranges)) {
      toast.warn('That range includes already-booked nights. Pick other dates.')
      setCheckIn(iso); setCheckOut('')
      return
    }
    setCheckOut(iso)
  }

  const releaseHold = (bookingId) => api.post(`/booking/${bookingId}/cancel`).catch(() => {})

  const openCheckout = (data) => {
    if (!window.Razorpay) {
      toast.error('Could not load the payment window. Check your connection and try again.')
      releaseHold(data.booking._id)
      return
    }
    settled.current = false
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      order_id: data.order.id,
      name: 'Airbnb Clone',
      description: `${home.houseName} - ${nights} night${nights > 1 ? 's' : ''}`,
      prefill: { name: user?.name, email: user?.email },
      theme: { color: '#ef4444' },
      handler: async (response) => {
        settled.current = true
        try {
          await api.post('/booking/verify', response)
          toast.success('Payment successful! Your booking is confirmed.')
        } catch (e) {
          toast.error(errMsg(e))
        }
        navigate('/bookings')
      },
      modal: {
        // closing the window without paying frees the dates straight away
        ondismiss: async () => {
          if (settled.current) return
          await releaseHold(data.booking._id)
          setSubmitting(false)
          toast.info('Payment cancelled. Your dates were released.')
        },
      },
    })
    rzp.on('payment.failed', (resp) => toast.error(resp?.error?.description || 'Payment failed. You can try again.'))
    rzp.open()
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!checkIn || !checkOut) return setError('Please choose check-in and check-out dates.')
    if (checkIn < today) return setError('Check-in date cannot be in the past.')
    if (checkOut <= checkIn) return setError('Check-out date must be after check-in date.')
    if (overlapsBooked(checkIn, checkOut, ranges)) return setError('This home is already booked for the selected dates.')

    setSubmitting(true)
    try {
      const { data } = await api.post('/booking', { homeId: id, checkIn, checkOut, paymentMethod: method })
      if (method === 'pay_at_property') {
        toast.success('Booking confirmed! Pay at the property.')
        navigate('/bookings')
      } else {
        openCheckout(data) // submitting stays true until the Razorpay window is resolved
      }
    } catch (err) {
      setError(errMsg(err))
      setSubmitting(false)
      // refresh availability in case someone just booked
      api.get(`/home/${id}/booked-dates`).then((b) => setRanges(b.data.ranges)).catch(() => {})
    }
  }

  if (!home) return <Spinner />

  return (
    <main className="container mx-auto px-4 sm:px-6 p-4 sm:p-8 mt-4 sm:mt-10 max-w-xl">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{home.houseName}</h2>
        <p className="text-gray-600 mb-1">📍 {home.location}</p>
        <p className="text-red-500 font-bold text-xl mb-6">{inr(home.price)}/night</p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center font-semibold">⚠️ {error}</div>}

        <div className="mb-6">
          <Calendar ranges={ranges} checkIn={checkIn} checkOut={checkOut} onPick={pick} />
        </div>

        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Check-in Date</label>
            <input type="date" min={today} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setCheckOut('') }} className={dateInput} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Check-out Date</label>
            <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={dateInput} required />
          </div>

          {nights > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2"><span className="text-gray-600">Total Nights</span><span className="font-bold text-gray-800">{nights}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Total Price</span><span className="font-bold text-red-500 text-xl">{inr(total)}</span></div>
            </div>
          )}

          <p className="block text-gray-700 font-semibold mb-2">Payment method</p>
          <div className="flex flex-col gap-3 mb-6">
            <label className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${method === 'razorpay' ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
              <input type="radio" name="method" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} />
              <span className="font-medium">Pay online <span className="text-gray-500 font-normal">(UPI, cards, netbanking via Razorpay)</span></span>
            </label>
            <label className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${method === 'pay_at_property' ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
              <input type="radio" name="method" checked={method === 'pay_at_property'} onChange={() => setMethod('pay_at_property')} />
              <span className="font-medium">Pay at property <span className="text-gray-500 font-normal">(cash on arrival)</span></span>
            </label>
          </div>

          <button disabled={submitting} className="w-full bg-red-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-600 transition disabled:opacity-60">
            {submitting ? 'Please wait...' : method === 'razorpay' ? `Pay ${total ? inr(total) : ''} & Book` : 'Confirm Booking'}
          </button>
          <Link to={`/homes/${id}`} className="block text-center text-gray-500 mt-4 hover:underline">← Back to listing</Link>
        </form>
      </div>
    </main>
  )
}
export default Reserve
