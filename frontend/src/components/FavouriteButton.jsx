import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const FavouriteButton = ({ homeId, className = '' }) => {
  const { favouriteIds, toggleFavourite } = useContext(AppContext)
  const isFav = favouriteIds.has(homeId)
  return (
    <button
      type="button"
      onClick={() => toggleFavourite(homeId)}
      className={`px-5 py-2.5 rounded-xl font-medium transition ${
        isFav ? 'bg-gray-100 text-red-500 hover:bg-gray-200' : 'bg-green-500 text-white hover:bg-green-600'
      } ${className}`}
    >
      {isFav ? '💔 Remove from Favourites' : '❤️ Add to Favourites'}
    </button>
  )
}
export default FavouriteButton
