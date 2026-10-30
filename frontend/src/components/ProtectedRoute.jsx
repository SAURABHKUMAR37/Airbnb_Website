import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const ProtectedRoute = () => {
  const { token } = useContext(AppContext)
  const location = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  return <Outlet />
}

export default ProtectedRoute
