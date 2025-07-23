'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

interface PBSArticle {
  title: string
  url: string
  summary: string
  publishedDate: string
  contentLength?: number
}

export default function TestPBSMonitorPage() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [fetchedArticles, setFetchedArticles] = useState<PBSArticle[]>([])
  const [lastFetch, setLastFetch] = useState<string | null>(null)

  const fetchPBSArticles = async () => {
    setIsFetching(true)
    
    try {
      const response = await fetch('/api/fetch-pbs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        if (data.success) {
          toast.success(`Found ${data.articles.length} relevant PBS articles`)
          setFetchedArticles(data.articles)
          setLastFetch(new Date().toISOString())
        } else {
          toast.error(data.message || 'Failed to fetch articles')
        }
      } else {
        toast.error(`Failed to fetch PBS articles: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error('Error fetching PBS articles')
      console.error('Error:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const triggerTestMonitoring = async () => {
    setIsMonitoring(true)
    
    try {
      const response = await fetch('/api/test-monitor-pbs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        if (data.success) {
          toast.success(data.message)
          if (data.details?.articlesCreated > 0) {
            toast.success(`🎉 Created ${data.details.articlesCreated} new draft articles!`, { duration: 5000 })
            toast.success('Check the Test Draft Editor to review and edit the articles before publishing', { duration: 7000 })
          }
        } else {
          toast.error(data.message)
          if (data.details?.errors?.length > 0) {
            console.error('TEST PBS monitoring errors:', data.details.errors)
          }
        }
        setLastRun(new Date().toISOString())
        // Refresh the fetched articles after monitoring
        if (fetchedArticles.length > 0) {
          setTimeout(() => fetchPBSArticles(), 1000)
        }
      } else {
        toast.error(`Failed to monitor PBS: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error('Error triggering TEST PBS monitoring')
      console.error('Error:', error)
    } finally {
      setIsMonitoring(false)
    }
  }

  return (
    <div className="bg-pbs-bg-light min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-pbs-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-4">
              TEST PBS NewsHour Monitor
            </h1>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
              <p className="text-blue-800 font-sans text-sm">
                <strong>Testing Mode:</strong> This monitor uses mock AI generation and local file storage. 
                No OpenAI quota or MongoDB required. Articles are saved as drafts for editing before publication.
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-pbs-gray-700 font-sans leading-relaxed mb-4">
              This system automatically monitors PBS NewsHour articles for specific keywords and generates 
              mock leftist perspective response articles. The system looks for articles containing 
              keywords related to labor, social justice, politics, and other progressive topics.
            </p>
            
            {/* Control Panel */}
            <div className="bg-pbs-gray-50 border border-pbs-gray-200 p-6 mb-6">
              <h3 className="font-sans font-semibold text-pbs-gray-900 mb-4">
                Monitor Controls
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fetch Articles */}
                <div className="space-y-3">
                  <h4 className="font-sans font-medium text-pbs-gray-800">1. Fetch PBS Articles</h4>
                  <p className="text-sm text-pbs-gray-600 font-sans">
                    Scan PBS NewsHour for articles matching your keywords
                  </p>
                  <button
                    onClick={fetchPBSArticles}
                    disabled={isFetching}
                    className={`w-full px-4 py-3 font-sans font-medium text-sm ${
                      isFetching
                        ? 'bg-pbs-gray-300 text-pbs-gray-500 cursor-not-allowed'
                        : 'bg-pbs-blue text-white hover:bg-pbs-dark-blue'
                    }`}
                  >
                    {isFetching ? 'Fetching Articles...' : 'Fetch PBS Articles'}
                  </button>
                  {lastFetch && (
                    <p className="text-xs text-pbs-gray-500 font-sans">
                      Last fetch: {new Date(lastFetch).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Generate Responses */}
                <div className="space-y-3">
                  <h4 className="font-sans font-medium text-pbs-gray-800">2. Generate Mock Responses</h4>
                  <p className="text-sm text-pbs-gray-600 font-sans">
                    Create mock leftist response articles for all fetched articles
                  </p>
                  <button
                    onClick={triggerTestMonitoring}
                    disabled={isMonitoring || fetchedArticles.length === 0}
                    className={`w-full px-4 py-3 font-sans font-medium text-sm ${
                      isMonitoring || fetchedArticles.length === 0
                        ? 'bg-pbs-gray-300 text-pbs-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isMonitoring ? 'Generating Articles...' : `Generate Mock Articles (${fetchedArticles.length})`}
                  </button>
                  {lastRun && (
                    <p className="text-xs text-pbs-gray-500 font-sans">
                      Last run: {new Date(lastRun).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-6 pt-4 border-t border-pbs-gray-200">
                <h4 className="font-sans font-medium text-pbs-gray-800 mb-3">Quick Links</h4>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="/admin/test-draft-editor" 
                    className="px-4 py-2 bg-blue-600 text-white font-sans text-sm hover:bg-blue-700 transition-colors"
                  >
                    📝 Edit Drafts
                  </a>
                  <a 
                    href="/admin/pbs-monitor" 
                    className="px-4 py-2 bg-pbs-gray-600 text-white font-sans text-sm hover:bg-pbs-gray-700 transition-colors"
                  >
                    🔧 Manage Keywords
                  </a>
                </div>
              </div>
            </div>

            {/* Fetched Articles Display */}
            {fetchedArticles.length > 0 && (
              <div className="bg-white border border-pbs-gray-200 p-6">
                <h3 className="font-sans font-semibold text-pbs-gray-900 mb-4">
                  Fetched PBS Articles ({fetchedArticles.length})
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {fetchedArticles.map((article, index) => (
                    <div key={index} className="border border-pbs-gray-200 p-4">
                      <h4 className="font-sans font-semibold text-pbs-gray-900 mb-2 text-sm">
                        {article.title}
                      </h4>
                      <p className="text-pbs-gray-600 font-sans text-xs mb-2">
                        {article.summary.substring(0, 200)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-pbs-gray-500 font-sans text-xs">
                          {new Date(article.publishedDate).toLocaleDateString()}
                        </span>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pbs-blue hover:underline font-sans text-xs"
                        >
                          View Original →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Information */}
            <div className="mt-6 bg-pbs-gray-50 border border-pbs-gray-200 p-4">
              <h4 className="font-sans font-medium text-pbs-gray-800 mb-2">System Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-sans">
                <div>
                  <span className="text-pbs-gray-600">Articles Found:</span>
                  <span className="ml-2 font-medium text-pbs-gray-900">{fetchedArticles.length}</span>
                </div>
                <div>
                  <span className="text-pbs-gray-600">Last Fetch:</span>
                  <span className="ml-2 font-medium text-pbs-gray-900">
                    {lastFetch ? new Date(lastFetch).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-pbs-gray-600">Last Generation:</span>
                  <span className="ml-2 font-medium text-pbs-gray-900">
                    {lastRun ? new Date(lastRun).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}