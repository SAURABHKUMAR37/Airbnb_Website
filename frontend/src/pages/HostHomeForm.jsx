import { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'
import { AppContext } from '../context/AppContext'
import Spinner from '../components/Spinner'

const field = 'w-full border border-gray-200 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 transition'
const MAX_PHOTOS = 10

const HostHomeForm = () => {
  const { id } = useParams()
  const editing = Boolean(id)
  const { navigate } = useContext(AppContext)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ houseName: '', price: '', location: '', description: '' })
  const [existing, setExisting] = useState([]) // photo URLs already saved
  const [files, setFiles] = useState([]) // new File objects
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  useEffect(() => {
    if (!editing) return
    api.get(`/host/homes/${id}`)
      .then(({ data }) => {
        const h = data.home
        setForm({ houseName: h.houseName, price: h.price, location: h.location, description: h.description || '' })
        setExisting(h.photos || [])
      })
      .catch((e) => { toast.error(errMsg(e)); navigate('/host-home-list') })
      .finally(() => setLoading(false))
  }, [id, editing, navigate])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const addFiles = (e) => {
    const picked = Array.from(e.target.files)
    e.target.value = ''
    const tooBig = picked.find((f) => f.size > 5 * 1024 * 1024)
    if (tooBig) return toast.error(`${tooBig.name} is larger than 5 MB`)
    if (existing.length + files.length + picked.length > MAX_PHOTOS) return toast.error(`Max ${MAX_PHOTOS} photos`)
    setFiles((prev) => [...prev, ...picked])
  }

  const submit = async (e) => {
    e.preventDefault()
    if (existing.length + files.length === 0) return toast.error('Please add at least one photo')
    const body = new FormData()
    Object.entries(form).forEach(([k, v]) => body.append(k, v))
    body.append('existingImages', JSON.stringify(existing))
    files.forEach((f) => body.append('images', f))

    setSaving(true)
    try {
      const { data } = editing ? await api.put(`/host/homes/${id}`, body) : await api.post('/host/homes', body)
      toast.success(data.message)
      navigate('/host-home-list')
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <main className="container mx-auto px-4 sm:px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-red-100 rounded-full text-4xl">🏠</div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">{editing ? 'Edit Your Home' : 'Register Your Home'}</h1>
          <p className="text-lg text-gray-500">List your property and start hosting guests</p>
        </div>

        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 p-6 sm:p-10">
          <form onSubmit={submit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">House Name</label>
              <input name="houseName" value={form.houseName} onChange={onChange} required minLength="3" maxLength="100" placeholder="Enter your house name" className={field} />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Price Per Night (₹)</label>
              <input type="number" name="price" value={form.price} onChange={onChange} required min="1" step="1" placeholder="Enter price" className={field} />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Location</label>
              <input name="location" value={form.location} onChange={onChange} required maxLength="120" placeholder="Enter location" className={field} />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea name="description" value={form.description} onChange={onChange} rows="4" maxLength="2000" placeholder="Describe your home..." className={field} />
              <p className="text-xs text-gray-400 mt-1">Note: rating is calculated automatically from guest reviews.</p>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-3">Photos <span className="text-gray-400 font-normal">(first one is the cover · up to {MAX_PHOTOS}, 5 MB each)</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existing.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute left-2 top-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">Cover</span>}
                    <button type="button" onClick={() => setExisting((l) => l.filter((u) => u !== url))} className="absolute right-2 top-2 bg-red-500 text-white w-7 h-7 rounded-full">✕</button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div key={src} className="relative aspect-square rounded-2xl overflow-hidden ring-2 ring-red-300">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <span className="absolute left-2 bottom-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                    <button type="button" onClick={() => setFiles((l) => l.filter((_, idx) => idx !== i))} className="absolute right-2 top-2 bg-red-500 text-white w-7 h-7 rounded-full">✕</button>
                  </div>
                ))}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-400 cursor-pointer transition">
                  <span className="text-3xl">＋</span>
                  <span className="text-sm">Add photos</span>
                  <input type="file" accept="image/*" multiple hidden onChange={addFiles} />
                </label>
              </div>
            </div>

            <button disabled={saving} className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-red-600 transition disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update Home' : 'Add Home'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
export default HostHomeForm
