import { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'
import Gallery from '../components/Gallery'
import FavouriteButton from '../components/FavouriteButton'
import Stars from '../components/Stars'
import Spinner from '../components/Spinner'
import { fmtDate, inr } from '../utils'

const card = 'max-w-6xl mx-auto mt-8 bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 p-6 sm:p-8'

const HomeDetail = () => {
  const { id } = useParams()
  const { token, user } = useContext(AppContext)
  const [home, setHome] = useState(null)
  const [reviews, setReviews] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const [h, r] = await Promise.all([api.get(`/home/${id}`), api.get(`/review/home/${id}`)])
      setHome(h.data.home)
      setReviews(r.data.reviews)
    } catch (e) {
      if (e.response?.status === 404 || e.response?.status === 400) setNotFound(true)
      else toast.error(errMsg(e))
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const mine = reviews.find((r) => r.user?._id === user?._id)

  const submitReview = async (e) => {
    e.preventDefault()
    if (!rating) return toast.error('Please choose a rating from 1 to 5')
    setSaving(true)
    try {
      await api.post(`/review/home/${id}`, { rating, comment })
      toast.success('Thanks for your review!')
      setRating(0)
      setComment('')
      await load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return
    try {
      await api.delete(`/review/${reviewId}`)
      toast.success('Review deleted')
      await load()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  if (notFound) return (
    <div className="text-center py-24">
      <p className="text-6xl mb-4">🏚️</p>
      <p className="text-xl text-gray-600 mb-6">That listing doesn't exist (anymore).</p>
      <Link to="/homes" className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold">Browse homes</Link>
    </div>
  )
  if (!home) return <Spinner />

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <Gallery photos={home.photos} alt={home.houseName} />

          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">{home.houseName}</h2>
            <p className="text-gray-500 text-lg mb-2">📍 <span className="font-medium text-gray-800">{home.location}</span></p>
            <p className="text-gray-400 text-sm mb-4">Hosted by <span className="font-medium text-gray-600">{home.host?.name || 'Airbnb'}</span></p>

            <div className="inline-flex items-center bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full mb-6 w-fit">
              ⭐ <span className="font-bold ml-2">{home.rating || 0}</span>
              <span className="text-gray-500 ml-2">({home.numReviews || 0} reviews)</span>
            </div>

            {home.description && <p className="text-gray-600 leading-relaxed mb-6">{home.description}</p>}

            <p className="text-3xl sm:text-4xl font-bold text-red-500 mb-8">
              {inr(home.price)} <span className="text-lg text-gray-500 font-normal">/ night</span>
            </p>

            <Link to={`/reserve/${home._id}`} className="bg-red-500 text-white px-6 py-4 rounded-2xl text-center font-semibold shadow-lg hover:bg-red-600 hover:scale-[1.02] transition-all duration-300">Book Now</Link>
            <FavouriteButton homeId={home._id} className="mt-4" />
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Leave a Review</h3>
        {!token ? (
          <p className="text-gray-500"><Link to="/login" className="text-red-500 font-bold hover:underline">Login</Link> to leave a review.</p>
        ) : mine ? (
          <p className="text-gray-500">You've already reviewed this home. Thanks for your feedback!</p>
        ) : (
          <form onSubmit={submitReview}>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Rating</label>
              <Stars value={rating} onChange={setRating} size="text-4xl" />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Comment</label>
              <textarea rows="4" maxLength="1000" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..."
                className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <button disabled={saving} className="bg-red-500 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-red-600 transition disabled:opacity-60">
              {saving ? 'Submitting...' : 'Submit Review ⭐'}
            </button>
          </form>
        )}
      </div>

      <div className={card}>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center">No reviews yet. Be the first to review!</p>
        ) : (
          <ul className="space-y-5">
            {reviews.map((r) => (
              <li key={r._id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-800">👤 {r.user?.name || 'Guest'}</span>
                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-semibold">⭐ {r.rating}/5</span>
                </div>
                {r.comment && <p className="text-gray-600 leading-relaxed">{r.comment}</p>}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-gray-400 text-sm">{fmtDate(r.createdAt)}</p>
                  {r.user?._id === user?._id && (
                    <button onClick={() => deleteReview(r._id)} className="text-sm text-red-500 hover:underline">Delete</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
export default HomeDetail
