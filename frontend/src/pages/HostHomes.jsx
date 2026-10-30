import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import Spinner from '../components/Spinner'
import { coverPhoto, fmtDate, inr } from '../utils'

const HostHomes = () => {
  const [homes, setHomes] = useState(null)

  const load = useCallback(() => {
    api.get('/host/homes').then((r) => setHomes(r.data.homes)).catch((e) => { toast.error(errMsg(e)); setHomes([]) })
  }, [])
  useEffect(load, [load])

  const remove = async (home) => {
    if (!window.confirm('Delete this listing? This also removes its bookings, reviews and favourites.')) return
    try {
      await api.delete(`/host/homes/${home._id}`)
      toast.success('Listing deleted')
      load()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  if (!homes) return <Spinner />
  const revenue = homes.flatMap((h) => h.bookings).reduce((s, b) => s + b.totalPrice, 0)

  return (
    <main className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">Host Dashboard 🏠</h2>
        <p className="text-lg text-gray-500">Manage your listed homes and bookings</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 p-6 flex justify-between items-center">
          <div><h3 className="text-xl font-bold text-gray-900">Your Properties</h3><p className="text-gray-500 text-sm">Homes you've listed</p></div>
          <div className="bg-red-500 text-white px-6 py-3 rounded-2xl text-3xl font-bold">{homes.length}</div>
        </div>
        <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 p-6 flex justify-between items-center">
          <div><h3 className="text-xl font-bold text-gray-900">Booking Revenue</h3><p className="text-gray-500 text-sm">Confirmed + completed stays</p></div>
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl text-2xl font-bold">{inr(revenue)}</div>
        </div>
      </div>

      {homes.length === 0 ? (
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
          <div className="text-7xl mb-5">🏠</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Homes Added Yet</h3>
          <p className="text-gray-500 mb-8">Start hosting by adding your first property.</p>
          <Link to="/host/add-home" className="inline-block bg-red-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:bg-red-600 transition">Add Home</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {homes.map((home) => (
            <div key={home._id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col lg:flex-row justify-between lg:items-center gap-5">
                <div className="flex items-center gap-5">
                  <img src={coverPhoto(home)} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                  <div>
                    <Link to={`/homes/${home._id}`} className="text-2xl sm:text-3xl font-bold text-gray-900 hover:text-red-500">{home.houseName}</Link>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">{home.bookings.length} Bookings</span>
                      <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-semibold">{inr(home.price)}/night</span>
                      <span className="bg-yellow-50 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-semibold">⭐ {home.rating || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to={`/host/edit-home/${home._id}`} className="bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-600 transition">Edit</Link>
                  <button onClick={() => remove(home)} className="bg-red-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-red-600 transition">Delete</button>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {home.bookings.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center"><p className="text-gray-400 text-lg">No bookings yet.</p></div>
                ) : (
                  <>
                    <h4 className="text-xl font-bold text-gray-800 mb-6">Recent Bookings</h4>
                    <div className="space-y-4">
                      {home.bookings.map((b) => (
                        <div key={b._id} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div><p className="text-gray-400 text-sm">Guest</p><p className="font-semibold text-gray-800">👤 {b.user?.name || 'Unknown'}</p><p className="text-xs text-gray-400">{b.user?.email}</p></div>
                          <div><p className="text-gray-400 text-sm">Stay Duration</p><p className="font-semibold text-gray-800">🌙 {b.totalNights} Nights</p></div>
                          <div><p className="text-gray-400 text-sm">Dates</p><p className="font-semibold text-gray-800">📅 {fmtDate(b.checkIn)}</p><p className="font-semibold text-gray-800">📅 {fmtDate(b.checkOut)}</p></div>
                          <div><p className="text-gray-400 text-sm">Revenue</p><p className="font-bold text-green-600 text-lg">{inr(b.totalPrice)}</p><p className="text-xs text-gray-400">{b.paymentStatus === 'paid' ? 'Paid online' : 'Pay at property'}</p></div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
export default HostHomes
