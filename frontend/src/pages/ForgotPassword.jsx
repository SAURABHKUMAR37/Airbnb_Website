import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMsg } from '../api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/forgot-password', { email })
      setMessage(data.message)
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
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full text-3xl">🔑</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
          <p className="text-gray-500">Enter your email and we'll send you a reset link.</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-center">{error}</div>}
        {message && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-6 text-center">{message}</div>}
        <form onSubmit={submit}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email"
            className="w-full border border-gray-200 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 mb-6" />
          <button disabled={loading} className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-red-600 transition disabled:opacity-60">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
        <p className="text-center mt-8"><Link to="/login" className="text-red-500 font-semibold hover:underline">← Back to login</Link></p>
      </div>
    </main>
  )
}
export default ForgotPassword
