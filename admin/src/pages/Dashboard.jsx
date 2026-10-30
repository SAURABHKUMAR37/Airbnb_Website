import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { fmtDate, inr } from '../config'

const Card = ({ icon, label, value, tone = 'bg-white' }) => (
  <div className={`${tone} border rounded-lg p-5 flex items-center gap-4`}>
    <span className="text-3xl">{icon}</span>
    <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-semibold text-gray-800">{value}</p></div>
  </div>
)

const Dashboard = () => {
  const [data, setData] = useState(null)
  useEffect(() => {
    api.get('/admin/stats').then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e)))
  }, [])
  if (!data) return <p>Loading...</p>
  const { stats, recent } = data

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Dashboard</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card icon="👥" label="Users" value={stats.users} />
        <Card icon="🏡" label="Homes" value={stats.homes} />
        <Card icon="🧾" label="Bookings" value={stats.bookings} />
        <Card icon="⭐" label="Reviews" value={stats.reviews} />
        <Card icon="💰" label="Online revenue (paid)" value={inr(stats.revenue)} tone="bg-green-50" />
        <Card icon="↩️" label="Refunds pending" value={stats.refundsPending} tone={stats.refundsPending ? 'bg-orange-50' : 'bg-white'} />
      </div>

      <h4 className="font-semibold mb-3">Recent bookings</h4>
      <div className="bg-white border rounded-lg divide-y">
        {recent.length === 0 && <p className="p-4 text-gray-400">No bookings yet.</p>}
        {recent.map((b) => (
          <div key={b._id} className="p-4 flex flex-wrap justify-between gap-2 text-sm">
            <div><p className="font-medium text-gray-800">{b.houseName}</p><p className="text-gray-500">{b.user?.name} · {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</p></div>
            <div className="text-right"><p className="font-semibold">{inr(b.totalPrice)}</p><p className="text-gray-500 capitalize">{b.status}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default Dashboard
