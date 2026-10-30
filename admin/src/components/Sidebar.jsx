import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/add', icon: '➕', label: 'Add Home' },
  { to: '/list', icon: '🏡', label: 'List Homes' },
  { to: '/bookings', icon: '🧾', label: 'Bookings' },
  { to: '/users', icon: '👥', label: 'Users' },
  { to: '/reviews', icon: '⭐', label: 'Reviews' },
]

const Sidebar = () => (
  <div className="w-[16%] min-w-[64px] min-h-screen border-r-2 bg-white">
    <div className="flex flex-col gap-3 pt-6 pl-[12%] text-[15px]">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end}
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${isActive ? 'bg-red-50 border-red-400 text-red-600' : 'hover:bg-gray-50'}`}>
          <span className="text-lg">{i.icon}</span>
          <p className="hidden md:block">{i.label}</p>
        </NavLink>
      ))}
    </div>
  </div>
)
export default Sidebar
