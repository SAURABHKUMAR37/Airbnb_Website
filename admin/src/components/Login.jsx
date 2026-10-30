import { useState } from 'react'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/user/admin', { email, password })
      setToken(data.token)
    } catch (error) {
      toast.error(errMsg(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold mb-1">🏠 Airbnb Admin</h1>
        <p className="text-sm text-gray-500 mb-5">Sign in to manage homes, bookings and users.</p>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Email Address</p>
            <input onChange={(e) => setEmail(e.target.value)} value={email} className="rounded-md w-full px-3 py-2" type="email" placeholder="your@email.com" required />
          </div>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input onChange={(e) => setPassword(e.target.value)} value={password} className="rounded-md w-full px-3 py-2" type="password" placeholder="Enter your password" required />
          </div>
          <button disabled={loading} className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black disabled:opacity-60" type="submit">{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  )
}
export default Login
