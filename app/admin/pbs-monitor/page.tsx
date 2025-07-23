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

interface ArticleStatus {
  url: string
  hasResponse: boolean
  responseArticle?: {
    title: string
    slug: string
  } | null
}

export default function PBSMonitorPage() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [fetchedArticles, setFetchedArticles] = useState<PBSArticle[]>([])
  const [articleStatus, setArticleStatus] = useState<ArticleStatus[]>([])
  const [lastFetch, setLastFetch] = useState<string | null>(null)
  
  // Keywords management state
  const [keywords, setKeywords] = useState<string[]>([])
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set())
  const [bulkKeywords, setBulkKeywords] = useState('')
  const [showBulkAdd, setShowBulkAdd] = useState(false)

  // Load keywords on component mount
  React.useEffect(() => {
    loadKeywords()
  }, [])

  const loadKeywords = async () => {
    setIsLoadingKeywords(true)
    try {
      const response = await fetch('/api/keywords', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setKeywords(data.keywords)
      } else {
        toast.error('Failed to load keywords')
      }
    } catch (error) {
      toast.error('Error loading keywords')
      console.error('Error:', error)
    } finally {
      setIsLoadingKeywords(false)
    }
  }

  const addKeyword = async () => {
    if (!newKeyword.trim()) return

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keywords: [newKeyword.trim()] })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.added.length > 0) {
          toast.success(`Added keyword: "${data.added[0]}"`)
          setKeywords(data.keywords)
          setNewKeyword('')
        } else {
          toast.error('Keyword already exists')
        }
      } else {
        toast.error(data.message || 'Failed to add keyword')
      }
    } catch (error) {
      toast.error('Error adding keyword')
      console.error('Error:', error)
    }
  }

  const removeSelectedKeywords = async () => {
    if (selectedKeywords.size === 0) return

    try {
      const response = await fetch('/api/keywords', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keywords: Array.from(selectedKeywords) })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Removed ${data.removed} keywords`)
        setKeywords(data.keywords)
        setSelectedKeywords(new Set())
      } else {
        toast.error(data.message || 'Failed to remove keywords')
      }
    } catch (error) {
      toast.error('Error removing keywords')
      console.error('Error:', error)
    }
  }

  const toggleKeywordSelection = (keyword: string) => {
    const newSelection = new Set(selectedKeywords)
    if (newSelection.has(keyword)) {
      newSelection.delete(keyword)
    } else {
      newSelection.add(keyword)
    }
    setSelectedKeywords(newSelection)
  }

  const addBulkKeywords = async () => {
    if (!bulkKeywords.trim()) return

    const keywordList = bulkKeywords
      .split(/[,\n]/)
      .map(k => k.trim())
      .filter(k => k.length > 0)

    if (keywordList.length === 0) return

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keywords: keywordList })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Added ${data.added.length} new keywords${data.duplicates > 0 ? ` (${data.duplicates} duplicates skipped)` : ''}`)
        setKeywords(data.keywords)
        setBulkKeywords('')
        setShowBulkAdd(false)
      } else {
        toast.error(data.message || 'Failed to add keywords')
      }
    } catch (error) {
      toast.error('Error adding keywords')
      console.error('Error:', error)
    }
  }

  const exportKeywords = () => {
    const keywordText = keywords.join('\n')
    const blob = new Blob([keywordText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pbs-monitor-keywords.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Keywords exported to file')
  }

  const resetToDefaults = async () => {
    if (!confirm('Reset to default keywords? This will replace all current keywords.')) return

    const defaultKeywords = [
      'labor', 'union', 'workers', 'strike', 'wages', 'employment',
      'healthcare', 'housing', 'inequality', 'poverty', 'welfare',
      'corporate', 'capitalism', 'economy', 'recession', 'inflation',
      'climate', 'environment', 'fossil fuel', 'renewable energy',
      'immigration', 'refugee', 'border', 'deportation',
      'police', 'criminal justice', 'prison', 'reform',
      'education', 'student debt', 'public school',
      'voting rights', 'democracy', 'election', 'gerrymandering',
      'tax', 'wealth', 'billionaire', 'minimum wage',
      'social security', 'medicare', 'medicaid'
    ]

    try {
      const response = await fetch('/api/keywords', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keywords: defaultKeywords })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Reset to default keywords')
        setKeywords(data.keywords)
        setSelectedKeywords(new Set())
      } else {
        toast.error(data.message || 'Failed to reset keywords')
      }
    } catch (error) {
      toast.error('Error resetting keywords')
      console.error('Error:', error)
    }
  }

  const checkExistingArticles = async (urls: string[]) => {
    try {
      const response = await fetch('/api/check-existing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setArticleStatus(data.urlStatus)
      }
    } catch (error) {
      console.error('Error checking existing articles:', error)
    }
  }

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
          
          // Check which articles already have responses
          if (data.articles.length > 0) {
            await checkExistingArticles(data.articles.map((a: PBSArticle) => a.url))
          }
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

  const triggerMonitoring = async () => {
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
            toast.success('Check the Draft Editor to review and edit articles before publishing', { duration: 7000 })
          }
        } else {
          toast.error(data.message)
          if (data.details?.errors?.length > 0) {
            console.error('PBS monitoring errors:', data.details.errors)
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
      toast.error('Error triggering PBS monitoring')
      console.error('Error:', error)
    } finally {
      setIsMonitoring(false)
    }
  }

  return (
    <div className="bg-pbs-bg-light min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-pbs-gray-200 p-8">
          <h1 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-4">
            PBS NewsHour Monitor
          </h1>
          <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
            <p className="text-green-800 font-sans text-sm">
              <strong>✅ System Active:</strong> Using mock AI generation and local file storage. 
              Articles are saved as drafts for editing before publication. No database or OpenAI quota required.
            </p>
          </div>
          
          <div className="mb-8">
            <p className="text-pbs-gray-700 font-sans leading-relaxed mb-4">
              This system automatically monitors PBS NewsHour articles for specific keywords and generates 
              leftist perspective response articles using AI. The system looks for articles containing 
              keywords related to labor, social justice, politics, and other progressive topics.
            </p>
            
            <div className="bg-pbs-gray-50 border border-pbs-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans font-semibold text-pbs-gray-900">
                  Monitored Keywords ({keywords.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportKeywords}
                    disabled={keywords.length === 0}
                    className="text-sm text-pbs-blue hover:text-pbs-dark-blue font-sans disabled:text-pbs-gray-400"
                  >
                    Export
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="text-sm text-orange-600 hover:text-orange-700 font-sans"
                  >
                    Reset
                  </button>
                  <button
                    onClick={loadKeywords}
                    disabled={isLoadingKeywords}
                    className="text-sm text-pbs-blue hover:text-pbs-dark-blue font-sans"
                  >
                    {isLoadingKeywords ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Add new keyword */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="Add single keyword..."
                    className="flex-1 px-3 py-2 border border-pbs-gray-300 text-sm font-sans focus:outline-none focus:border-pbs-blue"
                  />
                  <button
                    onClick={addKeyword}
                    disabled={!newKeyword.trim()}
                    className={`px-4 py-2 text-sm font-sans font-medium ${
                      newKeyword.trim()
                        ? 'bg-pbs-blue text-white hover:bg-pbs-dark-blue'
                        : 'bg-pbs-gray-300 text-pbs-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowBulkAdd(!showBulkAdd)}
                    className="px-4 py-2 text-sm font-sans font-medium bg-pbs-gray-600 text-white hover:bg-pbs-gray-700"
                  >
                    Bulk Add
                  </button>
                </div>

                {/* Bulk add interface */}
                {showBulkAdd && (
                  <div className="p-3 bg-pbs-gray-100 border border-pbs-gray-300">
                    <div className="mb-2">
                      <label className="block text-sm font-sans font-medium text-pbs-gray-900 mb-1">
                        Add Multiple Keywords (comma or line separated):
                      </label>
                      <textarea
                        value={bulkKeywords}
                        onChange={(e) => setBulkKeywords(e.target.value)}
                        placeholder="climate change, renewable energy, fossil fuels&#10;healthcare reform&#10;student debt"
                        rows={4}
                        className="w-full px-3 py-2 border border-pbs-gray-300 text-sm font-sans focus:outline-none focus:border-pbs-blue"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addBulkKeywords}
                        disabled={!bulkKeywords.trim()}
                        className={`px-4 py-2 text-sm font-sans font-medium ${
                          bulkKeywords.trim()
                            ? 'bg-pbs-blue text-white hover:bg-pbs-dark-blue'
                            : 'bg-pbs-gray-300 text-pbs-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Add All
                      </button>
                      <button
                        onClick={() => {
                          setShowBulkAdd(false)
                          setBulkKeywords('')
                        }}
                        className="px-4 py-2 text-sm font-sans font-medium bg-pbs-gray-400 text-white hover:bg-pbs-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Remove selected keywords */}
              {selectedKeywords.size > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-800 font-sans">
                      {selectedKeywords.size} keyword(s) selected
                    </span>
                    <button
                      onClick={removeSelectedKeywords}
                      className="px-3 py-1 bg-red-600 text-white text-sm font-sans font-medium hover:bg-red-700"
                    >
                      Remove Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Keywords display */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {isLoadingKeywords ? (
                  <div className="text-pbs-gray-500 font-sans">Loading keywords...</div>
                ) : keywords.length > 0 ? (
                  keywords.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => toggleKeywordSelection(keyword)}
                      className={`px-2 py-1 text-sm font-sans transition-colors ${
                        selectedKeywords.has(keyword)
                          ? 'bg-red-500 text-white'
                          : 'bg-pbs-blue text-white hover:bg-pbs-dark-blue'
                      }`}
                    >
                      {keyword}
                    </button>
                  ))
                ) : (
                  <div className="text-pbs-gray-500 font-sans">No keywords configured</div>
                )}
              </div>

              <div className="mt-3 text-xs text-pbs-gray-600 font-sans space-y-1">
                <div>• Click keywords to select them for removal</div>
                <div>• Use "Bulk Add" to add multiple keywords at once</div>
                <div>• "Export" saves keywords to a text file</div>
                <div>• "Reset" restores default progressive keywords</div>
              </div>
            </div>
          </div>

          <div className="border-t border-pbs-gray-200 pt-6">
            <h2 className="text-xl font-headline font-bold text-pbs-gray-900 mb-4">
              PBS Article Preview
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-pbs-gray-700 font-sans mb-2">
                  Fetch and preview PBS NewsHour articles that match our keywords
                </p>
                {lastFetch && (
                  <p className="text-sm text-pbs-gray-500 font-sans">
                    Last fetch: {new Date(lastFetch).toLocaleString()}
                  </p>
                )}
              </div>
              
              <button
                onClick={fetchPBSArticles}
                disabled={isFetching}
                className={`px-6 py-3 font-sans font-medium transition-colors ${
                  isFetching
                    ? 'bg-pbs-gray-400 text-white cursor-not-allowed'
                    : 'bg-pbs-gray-600 text-white hover:bg-pbs-gray-700'
                }`}
              >
                {isFetching ? 'Fetching...' : 'Fetch PBS Articles'}
              </button>
            </div>

            {/* Fetched Articles Display */}
            {fetchedArticles.length > 0 && (
              <div className="mt-6 bg-pbs-gray-50 border border-pbs-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-sans font-semibold text-pbs-gray-900">
                    Found {fetchedArticles.length} Relevant Articles
                  </h3>
                  {articleStatus.length > 0 && (
                    <div className="flex items-center space-x-4 text-sm font-sans">
                      <span className="text-green-700">
                        ✓ {articleStatus.filter(s => s.hasResponse).length} with responses
                      </span>
                      <span className="text-yellow-700">
                        ⏳ {articleStatus.filter(s => !s.hasResponse).length} need responses
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fetchedArticles.map((article, index) => {
                    const status = articleStatus.find(s => s.url === article.url)
                    const hasResponse = status?.hasResponse || false
                    
                    return (
                      <div key={index} className={`bg-white border p-3 ${
                        hasResponse ? 'border-green-200 bg-green-50' : 'border-pbs-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-sans font-medium text-pbs-gray-900 line-clamp-2 flex-1">
                            {article.title}
                          </h4>
                          {hasResponse ? (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-sans font-medium whitespace-nowrap">
                              ✓ Response Exists
                            </span>
                          ) : (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-sans font-medium whitespace-nowrap">
                              ⏳ No Response
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-pbs-gray-600 font-sans mb-2 line-clamp-2">
                          {article.summary}
                        </p>
                        
                        {hasResponse && status?.responseArticle && (
                          <div className="mb-2 p-2 bg-green-100 border border-green-200">
                            <p className="text-xs text-green-800 font-sans">
                              <strong>Our Response:</strong> {status.responseArticle.title}
                            </p>
                            <a 
                              href={`/article/${status.responseArticle.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-700 hover:underline"
                            >
                              View Our Article →
                            </a>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-pbs-gray-500 font-sans">
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pbs-blue hover:underline"
                          >
                            View PBS Original →
                          </a>
                          <div className="flex items-center space-x-2">
                            {article.contentLength && (
                              <span>{article.contentLength} chars</span>
                            )}
                            <span>•</span>
                            <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-pbs-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-headline font-bold text-pbs-gray-900 mb-4">
              Generate AI Articles
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-pbs-gray-700 font-sans mb-2">
                  Generate leftist perspective articles for relevant PBS content
                </p>
                {lastRun && (
                  <p className="text-sm text-pbs-gray-500 font-sans">
                    Last run: {new Date(lastRun).toLocaleString()}
                  </p>
                )}
              </div>
              
              <button
                onClick={triggerMonitoring}
                disabled={isMonitoring}
                className={`px-6 py-3 font-sans font-medium transition-colors ${
                  isMonitoring
                    ? 'bg-pbs-gray-400 text-white cursor-not-allowed'
                    : 'bg-pbs-blue text-white hover:bg-pbs-dark-blue'
                }`}
              >
                {isMonitoring ? 'Generating Mock Articles...' : 'Generate Mock Articles'}
              </button>
            </div>
            
            {/* Quick Navigation */}
            <div className="mt-6 pt-4 border-t border-pbs-gray-200">
              <h4 className="font-sans font-medium text-pbs-gray-800 mb-3">Next Steps</h4>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="/admin/draft-editor" 
                  className="px-4 py-2 bg-blue-600 text-white font-sans text-sm hover:bg-blue-700 transition-colors"
                >
                  📝 Edit Generated Drafts
                </a>
                <a 
                  href="/admin" 
                  className="px-4 py-2 bg-pbs-gray-600 text-white font-sans text-sm hover:bg-pbs-gray-700 transition-colors"
                >
                  🏠 Admin Dashboard
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-pbs-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-headline font-bold text-pbs-gray-900 mb-4">
              Automatic Monitoring
            </h2>
            
            <div className="bg-pbs-gray-50 border border-pbs-gray-200 p-4">
              <p className="text-pbs-gray-700 font-sans mb-3">
                For automatic monitoring, set up a cron job to call the monitoring endpoint:
              </p>
              
              <div className="bg-pbs-gray-900 text-pbs-gray-100 p-3 font-mono text-sm mb-3">
                <code>
                  curl -X GET "{window.location.origin}/api/cron/pbs-monitor" \<br/>
                  &nbsp;&nbsp;-H "Authorization: Bearer YOUR_CRON_SECRET"
                </code>
              </div>
              
              <p className="text-sm text-pbs-gray-600 font-sans">
                Recommended frequency: Every 2-4 hours to catch new articles without overwhelming the system.
              </p>
            </div>
          </div>

          <div className="border-t border-pbs-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-headline font-bold text-pbs-gray-900 mb-4">
              How It Works
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pbs-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-pbs-gray-700 font-sans">
                  System fetches the latest articles from PBS NewsHour RSS feed
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pbs-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-pbs-gray-700 font-sans">
                  Articles are filtered for monitored keywords related to progressive topics
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pbs-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-pbs-gray-700 font-sans">
                  AI generates a leftist perspective response article for each relevant PBS article
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pbs-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <p className="text-pbs-gray-700 font-sans">
                  Generated articles are automatically published with proper categorization and tags
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}