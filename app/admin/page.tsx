'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import LoginForm from '@/components/admin/LoginForm'

const AdminPage = () => {
  const router = useRouter()
  const { isLoading, isAuthenticated, checkAuth } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to the new streamlined dashboard
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, router])

  const handleLogin = () => {
    checkAuth()
  }

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  // This should not be reached due to the useEffect redirect, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}

export default AdminPage