import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { errMsg } from '../api'

const MAX_PHOTOS = 10
const blank = { houseName: '', price: '', location: '', description: '' }

/** Add Home (/add) and Edit Home (/edit/:id) share this form. */
const Add = () => {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(blank)
  const [existing, setExisting] = useState([])
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  useEffect(() => {
    setForm(blank); setExisting([]); setFiles([])
    if (!editing) return
    api.get(`/admin/homes/${id}`)
      .then(({ data }) => {
        const h = data.home
        setForm({ houseName: h.houseName, price: h.price, location: h.location, description: h.description || '' })
        setExisting(h.photos || [])
      })
      .catch((e) => { toast.error(errMsg(e)); navigate('/list') })
  }, [id, editing, navigate])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const addFiles = (e) => {
    const picked = Array.from(e.target.files)
    e.target.value = ''
    if (picked.some((f) => f.size > 5 * 1024 * 1024)) return toast.error('Each image must be 5 MB or smaller')
    if (existing.length + files.length + picked.length > MAX_PHOTOS) return toast.error(`Max ${MAX_PHOTOS} photos`)
    setFiles((p) => [...p, ...picked])
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (existing.length + files.length === 0) return toast.error('Add at least one photo')
    const body = new FormData()
    Object.entries(form).forEach(([k, v]) => body.append(k, v))
    body.append('existingImages', JSON.stringify(existing))
    files.forEach((f) => body.append('images', f))
    setSaving(true)
    try {
      const { data } = editing ? await api.put(`/admin/homes/${id}`, body) : await api.post('/admin/homes', body)
      toast.success(data.message)
      if (editing) navigate('/list')
      else { setForm(blank); setExisting([]); setFiles([]) }
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <h3 className="text-xl font-semibold">{editing ? 'Edit Home' : 'Add Home'}</h3>
      <div>
        <p className="mb-2">Photos <span className="text-xs text-gray-400">(first is the cover · max {MAX_PHOTOS})</span></p>
        <div className="flex flex-wrap gap-2">
          {existing.map((url) => (
            <div key={url} className="relative">
              <img className="w-20 h-20 object-cover rounded" src={url} alt="" />
              <button type="button" onClick={() => setExisting((l) => l.filter((u) => u !== url))} className="absolute -right-1 -top-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs">✕</button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={src} className="relative">
              <img className="w-20 h-20 object-cover rounded ring-2 ring-red-300" src={src} alt="" />
              <button type="button" onClick={() => setFiles((l) => l.filter((_, idx) => idx !== i))} className="absolute -right-1 -top-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs">✕</button>
            </div>
          ))}
          <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-2xl text-gray-400 cursor-pointer hover:border-red-400">
            ＋<input type="file" accept="image/*" multiple hidden onChange={addFiles} />
          </label>
        </div>
      </div>
      <div className="w-full">
        <p className="mb-2">House name</p>
        <input name="houseName" onChange={onChange} value={form.houseName} className="w-full max-w-lg px-3 py-2" type="text" placeholder="Type here" required minLength="3" maxLength="100" />
      </div>
      <div className="w-full">
        <p className="mb-2">Location</p>
        <input name="location" onChange={onChange} value={form.location} className="w-full max-w-lg px-3 py-2" type="text" placeholder="City / area" required maxLength="120" />
      </div>
      <div className="w-full">
        <p className="mb-2">Description</p>
        <textarea name="description" onChange={onChange} value={form.description} className="w-full max-w-lg px-3 py-2" rows="4" maxLength="2000" placeholder="Write content here" />
      </div>
      <div>
        <p className="mb-2">Price per night (₹)</p>
        <input name="price" onChange={onChange} value={form.price} className="w-full px-3 py-2 sm:w-32" type="number" min="1" placeholder="2500" required />
      </div>
      <button disabled={saving} className="w-32 py-3 mt-4 bg-black text-white disabled:opacity-60" type="submit">{saving ? 'Saving...' : editing ? 'UPDATE' : 'ADD'}</button>
    </form>
  )
}
export default Add
