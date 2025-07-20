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

  useEffect(() => {
    fetchArticles()
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Request timed out. Please check your connection and try again.')
        setLoading(false)
      }
    }, 30000) // 30 second timeout
    
    return () => clearTimeout(timeout)
  }, [])

  const fetchArticles = async () => {
    try {
      setError(null)
      console.log('Fetching articles...')
      const response = await fetch('/api/admin/articles', {
        credentials: 'include'
      })
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Articles data:', data)
        setArticles(data.articles || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        const errorMessage = `Failed to fetch articles: ${errorData.error || 'Unknown error'}`
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      const errorMessage = `Network error: ${error.message}`
      setError(errorMessage)
      toast.error('Failed to fetch articles - network error')
    } finally {
      setLoading(false)
    }
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Article Management</h2>
        <Link
          href="/admin/create"
          className="bg-leftist-red text-white px-4 py-2 rounded-md hover:bg-leftist-darkred transition-colors"
        >
          Create New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        {[
          { key: 'all', label: 'All Articles' },
          { key: 'published', label: 'Published' },
          { key: 'draft', label: 'Drafts' },
          { key: 'featured', label: 'Featured' },
          { key: 'ai', label: 'AI Generated' },
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === filterOption.key
                ? 'bg-leftist-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No articles found.</p>
          <Link
            href="/admin/create"
            className="bg-leftist-red text-white px-6 py-2 rounded-md hover:bg-leftist-darkred transition-colors"
          >
            Create Your First Article
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        By {article.author}
                        {article.aiGenerated && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                      {article.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {article.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.publishedAt 
                      ? format(new Date(article.publishedAt), 'MMM d, yyyy')
                      : format(new Date(article.createdAt), 'MMM d, yyyy')
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/edit/${article.slug}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => togglePublished(article.slug, article.published)}
                      className="text-green-600 hover:text-green-900"
                    >
                      {article.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => toggleFeatured(article.slug, article.featured)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {article.featured ? 'Unfeature' : 'Feature'}
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
      )}
    </div>
  )
}

export default ArticleManager