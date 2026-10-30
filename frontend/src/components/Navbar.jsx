import { useContext, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const links = [
  { to: '/homes', label: 'Homes' },
  { to: '/favourite', label: 'Favourites' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/host-home-list', label: 'Host Homes' },
  { to: '/host/add-home', label: 'Add Home' },
]

const Navbar = () => {
  const { token, user, logout, navigate } = useContext(AppContext)
  const [open, setOpen] = useState(false)

  const onLogout = () => {
    logout()
    setOpen(false)
    navigate('/login')
  }

  const desktop = ({ isActive }) =>
    `pb-1 transition ${isActive ? 'text-red-500 font-bold border-b-2 border-red-500' : 'text-gray-600 hover:text-red-500'}`
  const mobile = ({ isActive }) =>
    `block px-3 py-2 rounded-lg ${isActive ? 'bg-red-50 text-red-500 font-bold' : 'text-gray-600 hover:bg-gray-50'}`

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-red-500 font-bold text-xl sm:text-2xl shrink-0">🏠 Airbnb</Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={desktop}>{l.label}</NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <span className="font-medium text-gray-700 truncate max-w-[10rem]">👋 {user?.name || '...'}</span>
                <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition">Login</Link>
                <Link to="/signup" className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition">Sign Up</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-3 pb-2 space-y-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={mobile} onClick={() => setOpen(false)}>{l.label}</NavLink>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {token ? (
                <>
                  <p className="px-3 py-2 font-medium text-gray-700">👋 {user?.name}</p>
                  <div className="px-3">
                    <button onClick={onLogout} className="w-full bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition">Logout</button>
                  </div>
                </>
              ) : (
                <div className="flex gap-3 px-3">
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-xl border border-gray-300">Login</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center bg-red-500 text-white px-4 py-2 rounded-xl">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
