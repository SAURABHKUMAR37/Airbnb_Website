import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import Add from './pages/Add'
import List from './pages/List'
import Bookings from './pages/Bookings'
import Users from './pages/Users'
import Reviews from './pages/Reviews'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '')

  useEffect(() => {
    if (token) localStorage.setItem('adminToken', token)
    else localStorage.removeItem('adminToken')
  }, [token])

  useEffect(() => {
    const onExpired = () => { setToken(''); toast.info('Session expired. Please log in again.') }
    window.addEventListener('admin:expired', onExpired)
    return () => window.removeEventListener('admin:expired', onExpired)
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[75%] mx-auto ml-[max(3vw,16px)] mr-4 my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<Add />} />
                <Route path="/edit/:id" element={<Add />} />
                <Route path="/list" element={<List />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/users" element={<Users />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
export default App
