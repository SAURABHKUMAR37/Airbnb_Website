import axios from 'axios'
import { backendUrl } from './config'

const api = axios.create({ baseURL: `${backendUrl}/api` })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.token = token
  return config
})

// expired / invalid admin token -> App logs out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('adminToken')) window.dispatchEvent(new Event('admin:expired'))
    return Promise.reject(err)
  }
)

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong'
export default api
