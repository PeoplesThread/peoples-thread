'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Article {
  _id: string
  title: string
  slug: string
  category: string
  author: string
  published: boolean
  featured: boolean
  aiGenerated: boolean
  publishedAt?: string
  createdAt: string
  views: number
}

const ArticleManager = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    fetchArticlesWithRetry()
  }, [])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchArticlesWithRetry = async (attempt = 0) => {
    const maxRetries = 3
    const baseDelay = 1000 // 1 second
    
    try {
      setError(null)
      if (attempt === 0) {
        setLoading(true)
        setRetryCount(0)
      }
      
      console.log(`Fetching articles... (attempt ${attempt + 1}/${maxRetries + 1})`)
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/admin/articles', {
        credentials: 'include',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Articles data:', data)
        setArticles(data.articles || [])
        setRetryCount(0)
        return // Success - exit retry loop
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error(`Error fetching articles (attempt ${attempt + 1}):`, error)
      
      // If this was an abort (timeout), treat it as a network error
      if (error.name === 'AbortError') {
        error.message = 'Request timed out'
      }
      
      // If we haven't exceeded max retries, try again
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff
        console.log(`Retrying in ${delay}ms...`)
        setRetryCount(attempt + 1)
        
        await sleep(delay)
        return fetchArticlesWithRetry(attempt + 1)
      } else {
        // All retries exhausted
        const errorMessage = `Failed to fetch articles: ${error.message}`
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = () => {
    fetchArticlesWithRetry()
  }

  const togglePublished = async (slug: string, published: boolean) => {
    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !published }),
      })

      if (response.ok) {
        toast.success(`Article ${!published ? 'published' : 'unpublished'} successfully`)
        fetchArticles()
      } else {
        toast.error('Failed to update article')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const toggleFeatured = async (slug: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !featured }),
      })

      if (response.ok) {
        toast.success(`Article ${!featured ? 'featured' : 'unfeatured'} successfully`)
        fetchArticles()
      } else {
        toast.error('Failed to update article')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const deleteArticle = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Article deleted successfully')
        fetchArticles()
      } else {
        toast.error('Failed to delete article')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const filteredArticles = articles.filter(article => {
    switch (filter) {
      case 'published':
        return article.published
      case 'draft':
        return !article.published
      case 'featured':
        return article.featured
      case 'ai':
        return article.aiGenerated
      default:
        return true
    }
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'politics':
        return 'bg-red-100 text-red-800'
      case 'social-justice':
        return 'bg-blue-100 text-blue-800'
      case 'labor':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leftist-red mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Loading articles...</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500">
                Retry attempt {retryCount}/3
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading articles</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchArticles}
                  className="bg-red-600 text-white px-4 py-2 text-sm rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Article Management</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your published articles, drafts, and featured content
          </p>
        </div>
        <Link
          href="/admin/create"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-thread-navy to-blue-600 text-white text-sm font-medium rounded-lg hover:from-thread-navy hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Articles', count: articles.length },
            { key: 'published', label: 'Published', count: articles.filter(a => a.published).length },
            { key: 'draft', label: 'Drafts', count: articles.filter(a => !a.published).length },
            { key: 'featured', label: 'Featured', count: articles.filter(a => a.featured).length },
            { key: 'ai', label: 'AI Generated', count: articles.filter(a => a.aiGenerated).length },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === filterOption.key
                  ? 'bg-gradient-to-r from-thread-navy to-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {filterOption.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === filterOption.key
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
              }`}>
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No articles found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {filter === 'all' ? 'Get started by creating your first article.' : `No ${filter} articles found. Try a different filter.`}
          </p>
          {filter === 'all' && (
            <Link
              href="/admin/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-thread-navy to-blue-600 text-white font-medium rounded-lg hover:from-thread-navy hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Article
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-700/60">
              <thead className="bg-slate-50/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 dark:bg-slate-800/30 divide-y divide-slate-200/40 dark:divide-slate-700/40">
              {filteredArticles.map((article) => (
                <tr key={article._id} className="hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 mb-1">
                          {article.title}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                          <span>By {article.author}</span>
                          {article.aiGenerated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              AI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        article.published 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          article.published ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                      {article.featured && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-900 dark:text-white">
                      <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {article.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {article.publishedAt 
                        ? format(new Date(article.publishedAt), 'MMM d, yyyy')
                        : format(new Date(article.createdAt), 'MMM d, yyyy')
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/edit/${article.slug}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublished(article.slug, article.published)}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                          article.published
                            ? 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                            : 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={article.published ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                          {article.published ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          ) : null}
                        </svg>
                        {article.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => toggleFeatured(article.slug, article.featured)}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                          article.featured
                            ? 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                            : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {article.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => deleteArticle(article.slug)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticleManager