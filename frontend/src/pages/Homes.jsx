import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import HomeCard from '../components/HomeCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const FIELDS = ['title', 'location', 'minPrice', 'maxPrice', 'sort']
const input = 'w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400'

const Homes = () => {
  // filters live in the URL so searches are shareable / survive refresh
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((f) => [f, params.get(f) || ''])))
  const [data, setData] = useState({ homes: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const query = params.toString()

  useEffect(() => {
    setLoading(true)
    api.get(`/home?${query}`)
      .then((r) => setData(r.data))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false))
  }, [query])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const apply = (e) => {
    e.preventDefault()
    const next = new URLSearchParams()
    FIELDS.forEach((f) => form[f] && next.set(f, form[f]))
    setParams(next)
  }
  const clear = () => {
    setForm(Object.fromEntries(FIELDS.map((f) => [f, ''])))
    setParams({})
  }
  const goToPage = (p) => {
    const next = new URLSearchParams(params)
    next.set('page', p)
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:p-8 py-8">
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">🔍 Search Homes</h2>
        <form onSubmit={apply}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">House Name</label>
              <input name="title" value={form.title} onChange={onChange} placeholder="Search by title..." className={input} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Location</label>
              <input name="location" value={form.location} onChange={onChange} placeholder="Search by city..." className={input} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Min Price</label>
              <input type="number" min="0" name="minPrice" value={form.minPrice} onChange={onChange} placeholder="Min ₹" className={input} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Max Price</label>
              <input type="number" min="0" name="maxPrice" value={form.maxPrice} onChange={onChange} placeholder="Max ₹" className={input} />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Sort By</label>
              <select name="sort" value={form.sort} onChange={onChange} className={input}>
                <option value="">Default</option>
                <option value="rating">⭐ Top Rated</option>
                <option value="priceLow">💰 Price Low to High</option>
                <option value="priceHigh">💰 Price High to Low</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button type="submit" className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition">Search 🔍</button>
            <button type="button" onClick={clear} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition">Clear ✖</button>
          </div>
        </form>
      </div>

      {loading ? <Spinner /> : (
        <>
          <p className="text-gray-500 mb-4">Found <span className="font-bold text-red-500">{data.total}</span> homes</p>
          {data.homes.length === 0 ? (
            <div className="text-center mt-16 mb-16">
              <p className="text-6xl mb-4">🏠</p>
              <p className="text-gray-500 text-xl font-semibold">No homes found!</p>
              <p className="text-gray-400 mt-2">Try different search filters.</p>
              <Link to="/homes" onClick={clear} className="inline-block mt-6 bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition">Clear Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.homes.map((h) => <HomeCard key={h._id} home={h} />)}
            </div>
          )}
          <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
        </>
      )}
    </main>
  )
}
export default Homes
