'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import ArticleManager from '@/components/admin/ArticleManager'

import ScheduledPosts from '@/components/admin/ScheduledPosts'
import Analytics from '@/components/admin/Analytics'
import LoginForm from '@/components/admin/LoginForm'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('articles')
  const { user, isLoading, isAuthenticated, checkAuth, logout } = useAuth()

  const tabs = [
    { id: 'articles', name: 'Manage Articles', icon: '📝' },
    { id: 'scheduled', name: 'Scheduled Posts', icon: '⏰' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
  ]

  const handleLogin = () => {
    checkAuth()
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'articles':
        return <ArticleManager />
      case 'scheduled':
        return <ScheduledPosts />
      case 'analytics':
        return <Analytics />
      default:
        return <ArticleManager />
    }
  }

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thread-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-thread-navy to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">PT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Peoples Thread
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-thread-navy to-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative p-6 rounded-2xl border transition-all duration-200 text-left ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-thread-navy to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/25'
                  : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-2xl ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                }`}>
                  {tab.icon}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {tab.name}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    activeTab === tab.id 
                      ? 'text-blue-100' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {tab.id === 'articles' && 'Manage content'}
                    {tab.id === 'scheduled' && 'Automation'}
                    {tab.id === 'analytics' && 'Insights & data'}
                  </p>
                </div>
              </div>
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
          <div className="p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard