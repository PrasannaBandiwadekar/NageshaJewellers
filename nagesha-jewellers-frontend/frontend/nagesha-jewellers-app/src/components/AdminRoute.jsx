import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Same idea as ProtectedRoute, but also checks the user's Role is "Admin".
// A normal customer trying to visit /admin gets bounced to the homepage.
export default function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
