import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { inr } from '../config'

const List = () => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchList = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/homes')
      setList(data.homes)
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { fetchList() }, [fetchList])

  const removeHome = async (home) => {
    if (!window.confirm(`Delete "${home.houseName}" and all its bookings, reviews and favourites?`)) return
    try {
      const { data } = await api.delete(`/admin/homes/${home._id}`)
      toast.success(data.message)
      fetchList()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  return (
    <>
      <p className="mb-2 text-lg font-semibold">All Homes ({list.length})</p>
      <div className="flex flex-col gap-2">
        <div className={`hidden md:grid md:grid-cols-[1fr_3fr_2fr_1fr_1fr_1.3fr] items-center py-1 px-2 border bg-gray-100 text-sm`}>
          <b>Image</b><b>Name</b><b>Host</b><b>Price</b><b>Rating</b><b className="text-center">Action</b>
        </div>
        {loading && <p>Loading...</p>}
        {list.map((h) => (
          <div className={`grid grid-cols-1 md:grid-cols-[1fr_3fr_2fr_1fr_1fr_1.3fr] items-center gap-2 py-1 px-2 border text-sm bg-white`} key={h._id}>
            <img className="w-12 h-12 object-cover rounded" src={h.photos?.[0]} alt="" />
            <div><p className="font-medium text-gray-800">{h.houseName}</p><p className="text-gray-500">📍 {h.location}</p></div>
            <p>{h.host ? `${h.host.name}` : <span className="text-gray-400">Admin listing</span>}</p>
            <p>{inr(h.price)}</p>
            <p>⭐ {h.rating} <span className="text-gray-400">({h.numReviews})</span></p>
            <div className="flex gap-3 md:justify-center">
              <Link to={`/edit/${h._id}`} className="text-blue-600 hover:underline">Edit</Link>
              <button onClick={() => removeHome(h)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {!loading && list.length === 0 && <p className="text-gray-400">No homes yet.</p>}
      </div>
    </>
  )
}
export default List
