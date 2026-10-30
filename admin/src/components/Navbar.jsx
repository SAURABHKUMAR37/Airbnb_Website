const Navbar = ({ setToken }) => (
  <div className="flex items-center py-3 px-[4%] justify-between bg-white">
    <p className="text-red-500 font-bold text-xl">🏠 Airbnb <span className="text-gray-500 font-medium text-base">Admin</span></p>
    <button onClick={() => setToken('')} className="bg-gray-600 text-white px-5 py-2 rounded-full text-xs sm:text-sm">Logout</button>
  </div>
)
export default Navbar
