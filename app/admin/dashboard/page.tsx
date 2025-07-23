'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import LoginForm from '@/components/admin/LoginForm'
import UserManager from '@/components/admin/UserManager'

interface Article {
  _id: string
  title: string
  slug: string
  category: string
  published: boolean
  featured: boolean
  views: number
  createdAt: string
  publishedAt?: string
  author: string

}

interface ScheduledPost {
  _id: string
  topic: string
  category: string
  scheduledFor: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  createdAt: string
  articleId?: string
  errorMessage?: string
}

interface Analytics {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalViews: number
  newsletterSubscribers: number
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated, checkAuth, logout } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'articles' | 'users' | 'scheduled' | 'create'>('overview')

  // Create article form state
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'politics',
    tags: '',
    featured: false,
    published: true,
    author: '',
    metaDescription: '',
    slug: '',
    readingTime: '',
    difficulty: 'beginner',
    priority: 'normal',
    socialTitle: '',
    socialDescription: '',
    enableComments: true,
    enableNewsletter: true,
    customCSS: '',
    customJS: ''
  })

  // Schedule post form state
  const [newScheduledPost, setNewScheduledPost] = useState({
    topic: '',
    category: 'politics',
    scheduledFor: '',
    customPrompt: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [articlesRes, scheduledRes] = await Promise.all([
        fetch('/api/admin/articles', { credentials: 'include' }),
        fetch('/api/admin/scheduled-posts', { credentials: 'include' })
      ])

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json()
        const articlesList = articlesData.articles || []
        setArticles(articlesList)
        
        // Calculate analytics from articles data
        const totalViews = articlesList.reduce((sum: number, article: Article) => sum + (article.views || 0), 0)
        const publishedCount = articlesList.filter((article: Article) => article.published).length
        
        setAnalytics({
          totalArticles: articlesList.length,
          publishedArticles: publishedCount,
          draftArticles: articlesList.length - publishedCount,
          totalViews: totalViews,
          newsletterSubscribers: 0 // This would come from a separate API
        })
      }

      if (scheduledRes.ok) {
        const scheduledData = await scheduledRes.json()
        setScheduledPosts(scheduledData.posts || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!newArticle.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!newArticle.content.trim()) {
      toast.error('Content is required')
      return
    }
    if (!newArticle.excerpt.trim()) {
      toast.error('Excerpt is required')
      return
    }
    
    try {
      console.log('Submitting article:', newArticle)
      
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newArticle,
          tags: typeof newArticle.tags === 'string' ? newArticle.tags.split(',').map(tag => tag.trim()).filter(Boolean) : newArticle.tags
        })
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (response.ok) {
        toast.success('Article created successfully!')
        setNewArticle({
          title: '', content: '', excerpt: '', category: 'politics', tags: '', featured: false,
          published: true, author: '', metaDescription: '', slug: '', readingTime: '',
          difficulty: 'beginner', priority: 'normal', socialTitle: '', socialDescription: '',
          enableComments: true, enableNewsletter: true, customCSS: '', customJS: ''
        })
        loadData()
      } else {
        toast.error(result.error || 'Failed to create article')
        console.error('API Error:', result)
      }
    } catch (error) {
      console.error('Error creating article:', error)
      toast.error('Network error: Unable to create article')
    }
  }

  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScheduledPost)
      })

      if (response.ok) {
        toast.success('Post scheduled successfully!')
        setNewScheduledPost({ topic: '', category: 'politics', scheduledFor: '', customPrompt: '' })
        loadData()
      } else {
        toast.error('Failed to schedule post')
      }
    } catch (error) {
      toast.error('Error scheduling post')
    }
  }

  const togglePublished = async (slug: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Article ${!currentStatus ? 'published' : 'unpublished'}`)
        loadData()
      } else {
        toast.error('Failed to update article')
      }
    } catch (error) {
      toast.error('Error updating article')
    }
  }

  const deleteArticle = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Article deleted')
        loadData()
      } else {
        toast.error('Failed to delete article')
      }
    } catch (error) {
      toast.error('Error deleting article')
    }
  }

  const handleLogin = () => {
    checkAuth()
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
  }

  // Show loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-slate-50 rounded-lg px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {user?.username}
                </span>
              </div>
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium"
              >
                View Site →
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-slate-100 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'articles', name: 'Articles' },
              { id: 'users', name: 'Users' },
              { id: 'scheduled', name: 'Scheduled' },
              { id: 'create', name: 'Create' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Total Articles</p>
                      <p className="text-2xl font-semibold text-slate-900">{analytics.totalArticles}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Published</p>
                      <p className="text-2xl font-semibold text-slate-900">{analytics.publishedArticles}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Total Views</p>
                      <p className="text-2xl font-semibold text-slate-900">{analytics.totalViews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Scheduled</p>
                      <p className="text-2xl font-semibold text-slate-900">{scheduledPosts.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Articles */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Recent Articles</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {articles.slice(0, 5).map((article) => (
                    <div key={article._id} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">{article.title}</h4>
                        <p className="text-sm text-slate-500">
                          {format(new Date(article.createdAt), 'MMM d, yyyy')} • {article.views} views
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                        <Link
                          href={`/admin/edit/${article.slug}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Section */}
        {activeSection === 'articles' && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Manage Articles</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {articles.map((article) => (
                    <tr key={article._id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{article.title}</div>
                          <div className="text-sm text-slate-500">{article.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {format(new Date(article.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/admin/edit/${article.slug}`} className="text-blue-600 hover:text-blue-900">
                          Edit
                        </Link>
                        <button
                          onClick={() => togglePublished(article.slug, article.published)}
                          className="text-green-600 hover:text-green-900"
                        >
                          {article.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => deleteArticle(article.slug)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <UserManager token={user?.token || ''} />
        )}

        {/* Scheduled Posts Section */}
        {activeSection === 'scheduled' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Scheduled Posts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Topic</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Scheduled For</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {scheduledPosts.map((post) => (
                      <tr key={post._id}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{post.topic}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{post.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {format(new Date(post.scheduledFor), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.status === 'completed' ? 'bg-green-100 text-green-800' :
                            post.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                            post.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Schedule Form */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Schedule New Post</h4>
              <form onSubmit={handleSchedulePost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                    <input
                      type="text"
                      value={newScheduledPost.topic}
                      onChange={(e) => setNewScheduledPost({...newScheduledPost, topic: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter topic for AI generation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={newScheduledPost.category}
                      onChange={(e) => setNewScheduledPost({...newScheduledPost, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="politics">Politics</option>
                      <option value="social-justice">Social Justice</option>
                      <option value="labor">Labor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled For</label>
                    <input
                      type="datetime-local"
                      value={newScheduledPost.scheduledFor}
                      onChange={(e) => setNewScheduledPost({...newScheduledPost, scheduledFor: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Schedule Post
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Create Section */}
        {activeSection === 'create' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Create New Article</h3>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Advanced Editor</span>
                </div>
              </div>
              
              <form onSubmit={handleCreateArticle} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Article Title *</label>
                      <input
                        type="text"
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter a compelling title..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Slug</label>
                      <input
                        type="text"
                        value={newArticle.slug}
                        onChange={(e) => setNewArticle({...newArticle, slug: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="custom-url-slug"
                      />
                      <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate from title</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
                      <input
                        type="text"
                        value={newArticle.author}
                        onChange={(e) => setNewArticle({...newArticle, author: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Author name"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Content & Description
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Article Excerpt *</label>
                      <textarea
                        value={newArticle.excerpt}
                        onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description that appears in article previews..."
                        required
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>This appears in article cards and social shares</span>
                        <span>{newArticle.excerpt.length}/160</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Article Content *</label>
                      <textarea
                        value={newArticle.content}
                        onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                        rows={16}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="Write your article content here... Supports Markdown formatting."
                        required
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Supports Markdown formatting</span>
                        <span>{newArticle.content.length} characters</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorization & SEO */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Categorization & SEO
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <select
                        value={newArticle.category}
                        onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="politics">Politics & Government</option>
                        <option value="social-justice">Social Justice & Civil Rights</option>
                        <option value="labor">Labor & Workers' Rights</option>
                        <option value="environment">Environment & Climate</option>
                        <option value="economy">Economy & Finance</option>
                        <option value="healthcare">Healthcare & Public Health</option>
                        <option value="education">Education & Learning</option>
                        <option value="technology">Technology & Society</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Priority Level</label>
                      <select
                        value={newArticle.priority}
                        onChange={(e) => setNewArticle({...newArticle, priority: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                      <input
                        type="text"
                        value={newArticle.tags}
                        onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="politics, democracy, voting, election"
                      />
                      <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Reading Difficulty</label>
                      <select
                        value={newArticle.difficulty}
                        onChange={(e) => setNewArticle({...newArticle, difficulty: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner Friendly</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert Level</option>
                      </select>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description</label>
                      <textarea
                        value={newArticle.metaDescription}
                        onChange={(e) => setNewArticle({...newArticle, metaDescription: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SEO meta description for search engines..."
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Appears in search engine results</span>
                        <span>{newArticle.metaDescription.length}/160</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media & Sharing */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Social Media & Sharing
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Social Media Title</label>
                      <input
                        type="text"
                        value={newArticle.socialTitle}
                        onChange={(e) => setNewArticle({...newArticle, socialTitle: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Custom title for social shares"
                      />
                      <p className="text-xs text-slate-500 mt-1">Leave empty to use article title</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Reading Time</label>
                      <input
                        type="text"
                        value={newArticle.readingTime}
                        onChange={(e) => setNewArticle({...newArticle, readingTime: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5 min read"
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Social Media Description</label>
                      <textarea
                        value={newArticle.socialDescription}
                        onChange={(e) => setNewArticle({...newArticle, socialDescription: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Custom description for social media shares..."
                      />
                    </div>
                  </div>
                </div>

                {/* Publishing Options */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Publishing Options
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="published"
                          checked={newArticle.published}
                          onChange={(e) => setNewArticle({...newArticle, published: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="published" className="ml-3 block text-sm font-medium text-slate-900">
                          Publish immediately
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={newArticle.featured}
                          onChange={(e) => setNewArticle({...newArticle, featured: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-3 block text-sm font-medium text-slate-900">
                          Feature this article
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableComments"
                          checked={newArticle.enableComments}
                          onChange={(e) => setNewArticle({...newArticle, enableComments: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="enableComments" className="ml-3 block text-sm font-medium text-slate-900">
                          Enable comments
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableNewsletter"
                          checked={newArticle.enableNewsletter}
                          onChange={(e) => setNewArticle({...newArticle, enableNewsletter: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="enableNewsletter" className="ml-3 block text-sm font-medium text-slate-900">
                          Include in newsletter
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Customization */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Advanced Customization
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom CSS</label>
                      <textarea
                        value={newArticle.customCSS}
                        onChange={(e) => setNewArticle({...newArticle, customCSS: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder=".custom-style { color: #333; }"
                      />
                      <p className="text-xs text-slate-500 mt-1">Custom CSS for this article only</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom JavaScript</label>
                      <textarea
                        value={newArticle.customJS}
                        onChange={(e) => setNewArticle({...newArticle, customJS: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="console.log('Custom JS for this article');"
                      />
                      <p className="text-xs text-slate-500 mt-1">Custom JavaScript for this article only</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {newArticle.published ? 'Publish Article' : 'Save as Draft'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setNewArticle({
                      title: '', content: '', excerpt: '', category: 'politics', tags: '', featured: false,
                      published: true, author: '', metaDescription: '', slug: '', readingTime: '',
                      difficulty: 'beginner', priority: 'normal', socialTitle: '', socialDescription: '',
                      enableComments: true, enableNewsletter: true, customCSS: '', customJS: ''
                    })}
                    className="flex-1 sm:flex-none px-8 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Clear Form
                  </button>
                  
                  <button
                    type="button"
                    className="flex-1 sm:flex-none px-8 py-3 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Preview Article
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}