import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrap any page with <ProtectedRoute> to require login.
// Example: if someone who isn't logged in tries to visit /checkout,
// they get sent to /login instead.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}
