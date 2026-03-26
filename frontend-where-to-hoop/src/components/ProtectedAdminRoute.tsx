import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import useIsAdmin from '../hooks/useIsAdmin'
import { useAuth } from '../contexts/AuthContext'

const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const { isAdmin, isLoading } = useIsAdmin()

  if (!user) return <Navigate to="/signin" replace />
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Checking permissions...</p>
    </div>
  )
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}

export default ProtectedAdminRoute
