import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Decode JWT payload without any library
  const decodeToken = (tkn) => {
    try {
      const base64 = tkn.split('.')[1]
      const decoded = JSON.parse(atob(base64))
      return decoded
    } catch {
      return null
    }
  }

  // On mount: check localStorage for existing token
  useEffect(() => {
    const stored = localStorage.getItem('swa_token')
    if (stored) {
      const decoded = decodeToken(stored)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(stored)
        setUser(decoded)
        setIsAdmin(decoded.role === 'admin')
      } else {
        // Token expired — clean up
        localStorage.removeItem('swa_token')
      }
    }
  }, [])

  const login = useCallback((tkn) => {
    localStorage.setItem('swa_token', tkn)
    const decoded = decodeToken(tkn)
    setToken(tkn)
    setUser(decoded)
    setIsAdmin(decoded?.role === 'admin')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('swa_token')
    setToken(null)
    setUser(null)
    setIsAdmin(false)
    window.location.href = '/admin/login'
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
