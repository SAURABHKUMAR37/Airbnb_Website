import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { fmtDate } from '../config'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const load = useCallback(() => {
    api.get('/admin/reviews').then((r) => setReviews(r.data.reviews)).catch((e) => toast.error(errMsg(e)))
  }, [])
  useEffect(() => { load() }, [load])

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await api.delete(`/admin/reviews/${id}`)
      toast.success('Review deleted')
      load()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Reviews ({reviews.length})</h3>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r._id} className="bg-white border rounded p-4 flex justify-between gap-4">
            <div>
              <p className="font-medium text-gray-800">{r.home?.houseName || 'Deleted home'} <span className="text-yellow-600">⭐ {r.rating}/5</span></p>
              <p className="text-sm text-gray-500">by {r.user?.name || 'Deleted user'} · {fmtDate(r.createdAt)}</p>
              {r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
            </div>
            <button onClick={() => remove(r._id)} className="text-red-600 hover:underline self-start">Delete</button>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-400">No reviews yet.</p>}
      </div>
    </div>
  )
}
export default Reviews
