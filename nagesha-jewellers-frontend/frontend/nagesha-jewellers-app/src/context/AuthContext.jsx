import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser } from '../services/authService'

// A "Context" is React's way of sharing information (like "who is logged
// in?") with ANY component in the app, without manually passing it down
// through every single parent-to-child connection. Think of it as a
// notice board that any page can read from.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // On first load, check if we already have a saved login from before
  // (so refreshing the page doesn't log the user out)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nj_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (email, password) => {
    const response = await loginUser({ email, password })
    const data = response.data
    localStorage.setItem('nj_token', data.token)
    localStorage.setItem('nj_user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const register = async (fullName, email, password, phone) => {
    const response = await registerUser({ fullName, email, password, phone })
    const data = response.data
    localStorage.setItem('nj_token', data.token)
    localStorage.setItem('nj_user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('nj_token')
    localStorage.removeItem('nj_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'Admin'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// Any component can call useAuth() to get { user, login, register, logout, isAdmin }
export function useAuth() {
  return useContext(AuthContext)
}
