import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { backendUrl, errMsg } from '../api'

export const AppContext = createContext()

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate()
  const [token, setTokenState] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [favouriteIds, setFavouriteIds] = useState(new Set())

  const saveSession = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken)
    setTokenState(newToken)
    if (newUser) setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setTokenState('')
    setUser(null)
    setFavouriteIds(new Set())
  }, [])

  // load the profile + favourites whenever a token appears
  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const [me, favs] = await Promise.all([api.get('/user/me'), api.get('/favourite')])
        if (cancelled) return
        setUser(me.data.user)
        setFavouriteIds(new Set(favs.data.ids))
      } catch {
        /* a 401 is handled by the auth:expired listener below */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    const onExpired = () => {
      logout()
      toast.info('Your session expired. Please log in again.')
      navigate('/login')
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [logout, navigate])

  const toggleFavourite = useCallback(
    async (homeId) => {
      if (!token) {
        toast.info('Please log in to save favourites')
        navigate('/login')
        return false
      }
      const isFav = favouriteIds.has(homeId)
      // optimistic update, rolled back on failure
      setFavouriteIds((prev) => {
        const next = new Set(prev)
        isFav ? next.delete(homeId) : next.add(homeId)
        return next
      })
      try {
        isFav ? await api.delete(`/favourite/${homeId}`) : await api.post(`/favourite/${homeId}`)
        return true
      } catch (e) {
        setFavouriteIds((prev) => {
          const next = new Set(prev)
          isFav ? next.add(homeId) : next.delete(homeId)
          return next
        })
        toast.error(errMsg(e))
        return false
      }
    },
    [token, favouriteIds, navigate]
  )

  const value = useMemo(
    () => ({ token, user, saveSession, logout, favouriteIds, toggleFavourite, navigate, backendUrl }),
    [token, user, saveSession, logout, favouriteIds, toggleFavourite, navigate]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContextProvider
