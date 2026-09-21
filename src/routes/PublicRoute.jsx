import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth)

  if (!authChecked) return null
  if (isAuthenticated) return <Navigate to="/projectdashboard" replace />

  return children
}

export default PublicRoute