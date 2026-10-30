import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'
import Spinner from '../components/Spinner'

const ResetPassword = () => {
  const { token: resetToken } = useParams()
  const { saveSession, navigate } = useContext(AppContext)
  const [valid, setValid] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/user/reset-password/${resetToken}`).then(() => setValid(true)).catch(() => setValid(false))
  }, [resetToken])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post(`/user/reset-password/${resetToken}`, { password })
      saveSession(data.token, data.user)
      toast.success('Password updated. You are now logged in.')
      navigate('/')
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  if (valid === null) return <Spinner />
  if (!valid) return (
    <main className="container mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">⌛</p>
      <p className="text-xl text-gray-600 mb-6">This reset link is expired or invalid.</p>
      <Link to="/forgot-password" className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold">Request a new link</Link>
    </main>
  )

  return (
    <main className="container mx-auto px-4 sm:px-6 py-12">
      <div className="max-w-md mx-auto bg-white rounded-[32px] shadow-xl border border-gray-100 p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full text-3xl">🔒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-500">Choose a new password for your account.</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-center">{error}</div>}
        <form onSubmit={submit}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="8" placeholder="New password (min 8 characters)"
            className="w-full border border-gray-200 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 mb-6" />
          <button disabled={loading} className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-red-600 transition disabled:opacity-60">{loading ? 'Saving...' : 'Reset Password'}</button>
        </form>
      </div>
    </main>
  )
}
export default ResetPassword
