import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

const ProtectedUserRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/signin" replace />

  return <>{children}</>
}

export default ProtectedUserRoute
