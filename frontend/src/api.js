import axios from 'axios'

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const api = axios.create({ baseURL: `${backendUrl}/api` })

// attach the JWT on every request, like the ecommerce app does with `headers:{token}`
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.token = token
  return config
})

// an expired/invalid session while logged in -> tell the app to log out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(err)
  }
)

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong'

export default api
