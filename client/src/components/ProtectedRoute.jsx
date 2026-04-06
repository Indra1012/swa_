import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  // Check URL for Google OAuth token FIRST before checking localStorage
  const params = new URLSearchParams(window.location.search)
  const urlToken = params.get('token')
  
  // If token is in URL, save it to localStorage immediately
  if (urlToken) {
    localStorage.setItem('swa_token', urlToken)
  }

  const token = localStorage.getItem('swa_token')
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}