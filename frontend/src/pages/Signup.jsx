import { useContext, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'

const field = 'w-full border border-gray-200 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 transition'

const Signup = () => {
  const { token, saveSession, navigate } = useContext(AppContext)
  const from = useLocation().state?.from || '/'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to={from} replace />

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/register', form)
      saveSession(data.token, data.user)
      toast.success('Account created. Welcome!')
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-500">Join to book stays or host your home</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-center">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input name="name" value={form.name} onChange={onChange} required minLength="2" maxLength="60" placeholder="Your name" className={field} />
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="Enter your email" className={field} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} required minLength="8" placeholder="At least 8 characters" className={field} />
          </div>
          <button disabled={loading} className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-red-600 transition disabled:opacity-60">{loading ? 'Creating...' : 'Sign Up'}</button>
        </form>
        <p className="text-center text-gray-600 mt-8">Already have an account? <Link to="/login" state={{ from }} className="text-red-500 font-semibold hover:underline ml-1">Login</Link></p>
      </div>
    </main>
  )
}
export default Signup
