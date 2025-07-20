'use client'

import { useState, useEffect } from 'react'

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

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setError(null)
      console.log('Fetching analytics...')
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`, {
        credentials: 'include'
      })
      console.log('Analytics response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data:', data)
        setAnalytics(data)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Analytics API Error:', errorData)
        const errorMessage = `Failed to fetch analytics: ${errorData.error || errorData.message || 'Unknown error'}`
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      const errorMessage = `Network error: ${error.message}`
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{analytics.totalArticles}</div>
          <div className="text-sm text-gray-600">Total Articles</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{analytics.publishedArticles}</div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{analytics.draftArticles}</div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalViews.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{analytics.aiGeneratedArticles}</div>
          <div className="text-sm text-gray-600">AI Generated</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-leftist-red">{analytics.newsletterSubscribers}</div>
          <div className="text-sm text-gray-600">Subscribers</div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Articles by Category</h3>
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Articles</h3>
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
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
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Performance Insights:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {Math.round((analytics.aiGeneratedArticles / analytics.totalArticles) * 100)}% of your content is AI-generated</li>
          <li>• Average views per article: {Math.round(analytics.totalViews / analytics.publishedArticles || 0)}</li>
          <li>• Most popular category: {Object.entries(analytics.categoryStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}</li>
          <li>• {analytics.draftArticles} articles waiting to be published</li>
        </ul>
      </div>
    </div>
  )
}

export default Analytics