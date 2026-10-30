import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { fmtDate } from '../config'

const Users = () => {
  const [users, setUsers] = useState([])
  const load = useCallback(() => {
    api.get('/admin/users').then((r) => setUsers(r.data.users)).catch((e) => toast.error(errMsg(e)))
  }, [])
  useEffect(() => { load() }, [load])

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This also deletes their ${u.homes} home(s), bookings, reviews and favourites.`)) return
    try {
      await api.delete(`/admin/users/${u._id}`)
      toast.success('User deleted')
      load()
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Users ({users.length})</h3>
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[2fr_3fr_1fr_1fr_1.5fr_1fr] py-1 px-2 border bg-gray-100 text-sm"><b>Name</b><b>Email</b><b>Homes</b><b>Bookings</b><b>Joined</b><b className="text-center">Action</b></div>
        {users.map((u) => (
          <div key={u._id} className="grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr_1fr_1.5fr_1fr] items-center gap-2 py-2 px-2 border text-sm bg-white">
            <p className="font-medium text-gray-800">{u.name}</p>
            <p className="break-all">{u.email}</p>
            <p>{u.homes}</p>
            <p>{u.bookings}</p>
            <p>{fmtDate(u.createdAt)}</p>
            <button onClick={() => remove(u)} className="text-red-600 hover:underline md:text-center">Delete</button>
          </div>
        ))}
        {users.length === 0 && <p className="text-gray-400">No users yet.</p>}
      </div>
    </div>
  )
}
export default Users
