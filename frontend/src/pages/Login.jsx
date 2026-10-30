import { useContext, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'

const field = 'w-full border border-gray-200 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 transition'

const Login = () => {
  const { token, saveSession, navigate } = useContext(AppContext)
  const location = useLocation()
  const from = location.state?.from || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/login', { email, password })
      saveSession(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 py-12">
      <div className="max-w-md mx-auto bg-white rounded-[32px] shadow-xl border border-gray-100 p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full text-3xl">🏠</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500">Sign in to continue your journey</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-center">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" className={field} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" className={field} />
          </div>
          <div className="text-right mb-6">
            <Link to="/forgot-password" className="text-red-500 font-medium hover:underline">Forgot Password?</Link>
          </div>
          <button disabled={loading} className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-red-600 transition disabled:opacity-60">{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <p className="text-center text-gray-600 mt-8">Don't have an account? <Link to="/signup" state={{ from }} className="text-red-500 font-semibold hover:underline ml-1">Sign Up</Link></p>
      </div>
    </main>
  )
}
export default Login
