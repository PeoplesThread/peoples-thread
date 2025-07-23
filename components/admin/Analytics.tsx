'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface AnalyticsData {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalViews: number
  aiGeneratedArticles: number
  newsletterSubscribers: number
  categoryStats: {
    politics: number
    'social-justice': number
    labor: number
  }
  recentActivity: {
    date: string
    articles: number
    views: number
  }[]
  topArticles: {
    title: string
    slug: string
    views: number
    category: string
  }[]
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    fetchAnalyticsWithRetry()
  }, [timeRange])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchAnalyticsWithRetry = async (attempt = 0) => {
    const maxRetries = 3
    const baseDelay = 1000 // 1 second
    
    try {
      setError(null)
      if (attempt === 0) {
        setLoading(true)
        setRetryCount(0)
      }
      
      console.log(`Fetching analytics... (attempt ${attempt + 1}/${maxRetries + 1})`)
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`, {
        credentials: 'include',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log('Analytics response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data:', data)
        setAnalytics(data)
        setRetryCount(0)
        return // Success - exit retry loop
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Analytics API Error:', errorData)
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error(`Error fetching analytics (attempt ${attempt + 1}):`, error)
      
      // If this was an abort (timeout), treat it as a network error
      if (error.name === 'AbortError') {
        error.message = 'Request timed out'
      }
      
      // If we haven't exceeded max retries, try again
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff
        console.log(`Retrying analytics in ${delay}ms...`)
        setRetryCount(attempt + 1)
        
        await sleep(delay)
        return fetchAnalyticsWithRetry(attempt + 1)
      } else {
        // All retries exhausted
        const errorMessage = `Failed to fetch analytics: ${error.message}`
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = () => {
    fetchAnalyticsWithRetry()
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'politics':
        return 'Politics & Government'
      case 'social-justice':
        return 'Social Justice'
      case 'labor':
        return 'Labor Rights'
      default:
        return category
    }
  }

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
            <p className="text-gray-600 mb-2">Loading analytics...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchAnalytics}
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

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load analytics data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your content performance and audience engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.totalArticles}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Articles</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.publishedArticles}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Published</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{analytics.draftArticles}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Drafts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalViews.toLocaleString()}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Views</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.aiGeneratedArticles}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">AI Generated</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{analytics.newsletterSubscribers}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Subscribers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Articles by Category</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                    {getCategoryName(category)}
                  </span>
                </div>
                <div className="text-lg font-semibold">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Articles</h3>
          </div>
          <div className="space-y-4">
            {analytics.topArticles.slice(0, 5).map((article, index) => (
              <div key={article.slug} className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </div>
                  <a
                    href={`/article/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-leftist-red line-clamp-2"
                  >
                    {article.title}
                  </a>
                </div>
                <div className="ml-4 text-sm font-semibold text-gray-600">
                  {article.views.toLocaleString()} views
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
        </div>
        {analytics.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentActivity.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.articles}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.views.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No recent activity data available.</p>
        )}
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-700/60 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Performance Insights</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{Math.round((analytics.aiGeneratedArticles / analytics.totalArticles) * 100)}%</strong> of your content is AI-generated
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{Math.round(analytics.totalViews / analytics.publishedArticles || 0)}</strong> average views per article
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Most popular: <strong>{Object.entries(analytics.categoryStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{analytics.draftArticles}</strong> articles waiting to be published
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics