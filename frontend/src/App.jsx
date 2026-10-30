import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Homes from './pages/Homes'
import HomeDetail from './pages/HomeDetail'
import Reserve from './pages/Reserve'
import Bookings from './pages/Bookings'
import Favourites from './pages/Favourites'
import HostHomes from './pages/HostHomes'
import HostHomeForm from './pages/HostHomeForm'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'

const App = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <ToastContainer position="top-right" autoClose={3500} />
    <Navbar />
    <div className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homes" element={<Homes />} />
        <Route path="/homes/:id" element={<HomeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/reserve/:id" element={<Reserve />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/favourite" element={<Favourites />} />
          <Route path="/host-home-list" element={<HostHomes />} />
          <Route path="/host/add-home" element={<HostHomeForm />} />
          <Route path="/host/edit-home/:id" element={<HostHomeForm />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
    <Footer />
  </div>
)

export default App
