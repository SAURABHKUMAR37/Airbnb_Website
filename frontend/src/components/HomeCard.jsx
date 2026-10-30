import { Link } from 'react-router-dom'
import FavouriteButton from './FavouriteButton'
import { coverPhoto, inr } from '../utils'

/** variant="featured" = Details + Book buttons (landing page); "list" = Details + favourite (search page). */
const HomeCard = ({ home, variant = 'list' }) => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <Link to={`/homes/${home._id}`} className="overflow-hidden block">
      <img src={coverPhoto(home)} alt={home.houseName} loading="lazy" className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition duration-500" />
    </Link>
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-lg font-semibold text-gray-800 truncate">{home.houseName}</h3>
      <p className="text-gray-500 text-sm mt-1">📍 {home.location}</p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-red-500 font-bold text-lg">
          {inr(home.price)} <span className="text-gray-500 text-sm font-normal">/ night</span>
        </span>
        <span className="font-medium text-gray-700">⭐ {home.rating || 0}</span>
      </div>
      {variant === 'featured' ? (
        <div className="flex gap-3 mt-5">
          <Link to={`/homes/${home._id}`} className="flex-1 text-center bg-gray-900 text-white py-2.5 rounded-xl hover:bg-black transition">Details</Link>
          <Link to={`/reserve/${home._id}`} className="flex-1 text-center bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition">Book</Link>
        </div>
      ) : (
        <>
          <Link to={`/homes/${home._id}`} className="block text-center bg-gray-900 text-white px-4 py-2.5 rounded-xl mt-4 font-semibold hover:bg-black transition">View Details</Link>
          <FavouriteButton homeId={home._id} className="mt-3 w-full" />
        </>
      )}
    </div>
  </div>
)
export default HomeCard
