import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'
import Spinner from '../components/Spinner'
import { coverPhoto, inr } from '../utils'

const Favourites = () => {
  const { toggleFavourite } = useContext(AppContext)
  const [homes, setHomes] = useState(null)
  const [removed, setRemoved] = useState(new Set())

  useEffect(() => {
    api.get('/favourite').then((r) => setHomes(r.data.homes)).catch((e) => { toast.error(errMsg(e)); setHomes([]) })
  }, [])

  const remove = async (homeId) => {
    if (await toggleFavourite(homeId)) setRemoved((s) => new Set(s).add(homeId))
  }

  if (!homes) return <Spinner />
  const visible = homes.filter((h) => !removed.has(h._id))

  return (
    <main className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">My Favourites ❤️</h2>
        <p className="text-gray-500 text-lg">Your saved homes in one place</p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
          <div className="text-7xl mb-5">❤️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Favourite Homes Yet</h3>
          <p className="text-gray-500 mb-8">Save your favourite homes and they will appear here.</p>
          <Link to="/homes" className="inline-block bg-red-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:bg-red-600 transition">Explore Homes</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visible.map((h) => (
            <div key={h._id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <img src={coverPhoto(h)} alt={h.houseName} className="w-full h-48 object-cover" />
              <div className="p-6 flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{h.houseName}</h3>
                  <p className="text-gray-500 text-sm">📍 {h.location} · {inr(h.price)}/night</p>
                  <Link to={`/homes/${h._id}`} className="text-red-500 font-semibold hover:underline text-sm">View details &rarr;</Link>
                </div>
                <button onClick={() => remove(h._id)} className="shrink-0 bg-red-500 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-red-600 transition">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
export default Favourites
