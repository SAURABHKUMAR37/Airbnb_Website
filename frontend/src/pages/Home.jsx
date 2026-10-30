import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import HomeCard from '../components/HomeCard'
import Spinner from '../components/Spinner'

const Home = () => {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [homes, setHomes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/home', { params: { limit: 8 } })
      .then((r) => setHomes(r.data.homes))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false))
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/homes?location=${encodeURIComponent(location.trim())}`)
  }

  return (
    <>
      <section className="bg-gradient-to-br from-red-50 via-white to-gray-50 py-14 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Find your next stay</h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">Unique homes and experiences, all around the world.</p>
          <form onSubmit={onSearch} className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-3 flex flex-col sm:flex-row gap-3">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where are you going?"
              className="flex-1 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-400" />
            <button type="submit" className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition">Search 🔍</button>
          </form>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Explore Amazing Homes</h2>
          <Link to="/homes" className="text-red-500 font-semibold hover:underline whitespace-nowrap">View all &rarr;</Link>
        </div>

        {loading ? <Spinner /> : homes.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No homes listed yet. Be the first to <Link to="/host/add-home" className="text-red-500 underline">add one</Link>!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {homes.map((h) => <HomeCard key={h._id} home={h} variant="featured" />)}
          </div>
        )}
      </main>
    </>
  )
}
export default Home
