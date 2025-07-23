'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface PBSArticle {
  title: string
  url: string
  summary: string
  publishedDate: string
  contentLength?: number
}

interface DraftArticle {
  id?: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  sourceUrl: string
  sourceTitle: string
  sourcePublishedDate: string
}

interface SavedDraft {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  sourceUrl: string
  sourceTitle: string
  aiGenerated: boolean
  createdAt: string
}

export default function DraftEditorPage() {
  const [pbsArticles, setPbsArticles] = useState<PBSArticle[]>([])
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([])
  const [selectedArticle, setSelectedArticle] = useState<PBSArticle | null>(null)
  const [draft, setDraft] = useState<DraftArticle | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false)
  const [activeTab, setActiveTab] = useState<'pbs' | 'drafts'>('pbs')

  // Load PBS articles and drafts on component mount
  useEffect(() => {
    loadPBSArticles()
    loadSavedDrafts()
  }, [])

  const loadPBSArticles = async () => {
    setIsLoadingArticles(true)
    try {
      const response = await fetch('/api/fetch-pbs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPbsArticles(data.articles)
        toast.success(`Loaded ${data.articles.length} PBS articles`)
      } else {
        toast.error(data.message || 'Failed to load PBS articles')
      }
    } catch (error) {
      toast.error('Error loading PBS articles')
      console.error('Error:', error)
    } finally {
      setIsLoadingArticles(false)
    }
  }

  const loadSavedDrafts = async () => {
    setIsLoadingDrafts(true)
    try {
      const response = await fetch('/api/test-drafts', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSavedDrafts(data.drafts)
        if (data.drafts.length > 0) {
          toast.success(`Loaded ${data.drafts.length} saved drafts`)
        }
      } else {
        toast.error(data.error || 'Failed to load saved drafts')
      }
    } catch (error) {
      toast.error('Error loading saved drafts')
      console.error('Error:', error)
    } finally {
      setIsLoadingDrafts(false)
    }
  }

  const loadDraftForEditing = async (draftId: string) => {
    try {
      const response = await fetch(`/api/test-draft/${draftId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDraft({
          id: data.draft.id,
          title: data.draft.title,
          content: data.draft.content,
          excerpt: data.draft.excerpt,
          category: data.draft.category,
          tags: data.draft.tags,
          sourceUrl: data.draft.sourceUrl || '',
          sourceTitle: data.draft.sourceTitle || '',
          sourcePublishedDate: ''
        })
        setSelectedArticle(null)
        toast.success('Draft loaded for editing')
      } else {
        toast.error(data.error || 'Failed to load draft')
      }
    } catch (error) {
      toast.error('Error loading draft')
      console.error('Error:', error)
    }
  }

  const deleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    try {
      const response = await fetch(`/api/test-drafts?id=${draftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Draft deleted successfully')
        loadSavedDrafts() // Refresh the list
        if (draft?.id === draftId) {
          setDraft(null) // Clear editor if this draft was being edited
        }
      } else {
        toast.error(data.error || 'Failed to delete draft')
      }
    } catch (error) {
      toast.error('Error deleting draft')
      console.error('Error:', error)
    }
  }

  const generateDraft = async (pbsArticle: PBSArticle) => {
    setIsGenerating(true)
    setSelectedArticle(pbsArticle)
    
    try {
      const response = await fetch('/api/generate-mock-draft', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pbsArticle })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDraft(data.draft)
        toast.success('Mock draft generated successfully!')
        if (data.note) {
          toast.success(data.note, { duration: 5000 })
        }
      } else {
        toast.error(data.details || data.error || 'Failed to generate draft')
      }
    } catch (error) {
      toast.error('Error generating draft')
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveDraft = async (publish: boolean = false) => {
    if (!draft) return

    setIsSaving(true)
    
    try {
      let response
      
      if (draft.id) {
        // Update existing draft
        response = await fetch(`/api/test-draft/${draft.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: draft.title,
            content: draft.content,
            excerpt: draft.excerpt,
            category: draft.category,
            tags: draft.tags,
            published: publish
          })
        })
      } else {
        // Create new draft
        response = await fetch('/api/test-save-draft', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PBS_MONITOR_API_KEY || 'your-secret-key'}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...draft,
            published: publish
          })
        })
      }

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`Article ${publish ? 'published' : 'saved as draft'} successfully!`)
        if (publish) {
          toast.success(`🎉 Article published with slug: ${data.article.slug}`, { duration: 5000 })
        }
        // Refresh drafts list
        loadSavedDrafts()
        // Reset the form
        setDraft(null)
        setSelectedArticle(null)
      } else {
        if (response.status === 409) {
          toast.error('An article with this source URL already exists')
        } else {
          toast.error(data.details || data.error || `Failed to ${publish ? 'publish' : 'save'} article`)
        }
      }
    } catch (error) {
      toast.error(`Error ${publish ? 'publishing' : 'saving'} article`)
      console.error('Error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateDraft = (field: keyof DraftArticle, value: string | string[]) => {
    if (!draft) return
    setDraft({ ...draft, [field]: value })
  }

  return (
    <div className="bg-pbs-bg-light min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-pbs-gray-200 p-8">
          <h1 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-4">
            Draft Article Editor
          </h1>
          <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
            <p className="text-green-800 font-sans text-sm">
              <strong>✅ System Active:</strong> Using local file storage and mock AI generation. 
              Articles are saved as drafts for editing before publication. No database or OpenAI quota required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - PBS Articles & Drafts */}
            <div>
              {/* Tab Navigation */}
              <div className="flex border-b border-pbs-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab('pbs')}
                  className={`px-4 py-2 font-sans text-sm font-medium ${
                    activeTab === 'pbs'
                      ? 'border-b-2 border-pbs-blue text-pbs-blue'
                      : 'text-pbs-gray-500 hover:text-pbs-gray-700'
                  }`}
                >
                  PBS Articles ({pbsArticles.length})
                </button>
                <button
                  onClick={() => setActiveTab('drafts')}
                  className={`px-4 py-2 font-sans text-sm font-medium ${
                    activeTab === 'drafts'
                      ? 'border-b-2 border-pbs-blue text-pbs-blue'
                      : 'text-pbs-gray-500 hover:text-pbs-gray-700'
                  }`}
                >
                  Saved Drafts ({savedDrafts.length})
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-headline font-semibold text-pbs-gray-900">
                  {activeTab === 'pbs' ? 'PBS Articles' : 'Saved Drafts'}
                </h2>
                <button
                  onClick={activeTab === 'pbs' ? loadPBSArticles : loadSavedDrafts}
                  disabled={activeTab === 'pbs' ? isLoadingArticles : isLoadingDrafts}
                  className="px-4 py-2 bg-pbs-blue text-white font-sans text-sm hover:bg-pbs-dark-blue disabled:bg-pbs-gray-300"
                >
                  {(activeTab === 'pbs' ? isLoadingArticles : isLoadingDrafts) ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeTab === 'pbs' ? (
                  // PBS Articles Tab
                  pbsArticles.length === 0 ? (
                    <p className="text-pbs-gray-500 font-sans">
                      {isLoadingArticles ? 'Loading articles...' : 'No PBS articles found. Try refreshing or check your keywords.'}
                    </p>
                  ) : (
                    pbsArticles.map((article, index) => (
                      <div
                        key={index}
                        className={`border border-pbs-gray-200 p-4 cursor-pointer hover:bg-pbs-gray-50 ${
                          selectedArticle?.url === article.url ? 'bg-pbs-blue-50 border-pbs-blue' : ''
                        }`}
                        onClick={() => setSelectedArticle(article)}
                      >
                        <h3 className="font-sans font-semibold text-pbs-gray-900 mb-2 text-sm">
                          {article.title}
                        </h3>
                        <p className="text-pbs-gray-600 font-sans text-xs mb-2">
                          {article.summary.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-pbs-gray-500 font-sans text-xs">
                            {new Date(article.publishedDate).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              generateDraft(article)
                            }}
                            disabled={isGenerating}
                            className="px-3 py-1 bg-green-600 text-white font-sans text-xs hover:bg-green-700 disabled:bg-pbs-gray-300"
                          >
                            {isGenerating && selectedArticle?.url === article.url ? 'Generating...' : 'Generate Mock Draft'}
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  // Saved Drafts Tab
                  savedDrafts.length === 0 ? (
                    <p className="text-pbs-gray-500 font-sans">
                      {isLoadingDrafts ? 'Loading drafts...' : 'No saved drafts found. Generate some drafts from PBS articles first.'}
                    </p>
                  ) : (
                    savedDrafts.map((savedDraft) => (
                      <div
                        key={savedDraft.id}
                        className={`border border-pbs-gray-200 p-4 cursor-pointer hover:bg-pbs-gray-50 ${
                          draft?.id === savedDraft.id ? 'bg-green-50 border-green-500' : ''
                        }`}
                        onClick={() => loadDraftForEditing(savedDraft.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-sans font-semibold text-pbs-gray-900 text-sm flex-1">
                            {savedDraft.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDraft(savedDraft.id)
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                            title="Delete draft"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-pbs-gray-600 font-sans text-xs mb-2">
                          {savedDraft.excerpt.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-pbs-gray-500 font-sans text-xs">
                              {new Date(savedDraft.createdAt).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 bg-pbs-gray-100 text-pbs-gray-600 font-sans text-xs rounded">
                              {savedDraft.category}
                            </span>
                            {savedDraft.aiGenerated && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 font-sans text-xs rounded">
                                AI
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              loadDraftForEditing(savedDraft.id)
                            }}
                            className="px-3 py-1 bg-blue-600 text-white font-sans text-xs hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Right Column - Draft Editor */}
            <div>
              <h2 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-4">
                Draft Editor
              </h2>

              {!draft ? (
                <div className="border border-pbs-gray-200 p-8 text-center">
                  <p className="text-pbs-gray-500 font-sans">
                    Select a PBS article and generate a draft to start editing
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-sans font-medium text-pbs-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => updateDraft('title', e.target.value)}
                      className="w-full px-3 py-2 border border-pbs-gray-300 font-sans text-sm focus:outline-none focus:border-pbs-blue"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-sans font-medium text-pbs-gray-700 mb-1">
                      Excerpt
                    </label>
                    <textarea
                      value={draft.excerpt}
                      onChange={(e) => updateDraft('excerpt', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-pbs-gray-300 font-sans text-sm focus:outline-none focus:border-pbs-blue"
                    />
                  </div>

                  {/* Category and Tags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-sans font-medium text-pbs-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={draft.category}
                        onChange={(e) => updateDraft('category', e.target.value)}
                        className="w-full px-3 py-2 border border-pbs-gray-300 font-sans text-sm focus:outline-none focus:border-pbs-blue"
                      >
                        <option value="politics">Politics</option>
                        <option value="social-justice">Social Justice</option>
                        <option value="labor">Labor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-sans font-medium text-pbs-gray-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={draft.tags.join(', ')}
                        onChange={(e) => updateDraft('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                        className="w-full px-3 py-2 border border-pbs-gray-300 font-sans text-sm focus:outline-none focus:border-pbs-blue"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-sans font-medium text-pbs-gray-700 mb-1">
                      Content (HTML)
                    </label>
                    <textarea
                      value={draft.content}
                      onChange={(e) => updateDraft('content', e.target.value)}
                      rows={15}
                      className="w-full px-3 py-2 border border-pbs-gray-300 font-sans text-sm focus:outline-none focus:border-pbs-blue font-mono"
                    />
                  </div>

                  {/* Source Info */}
                  <div className="bg-pbs-gray-50 border border-pbs-gray-200 p-4">
                    <h4 className="font-sans font-medium text-pbs-gray-900 mb-2">Source Article</h4>
                    <p className="text-sm font-sans text-pbs-gray-700 mb-1">
                      <strong>Title:</strong> {draft.sourceTitle}
                    </p>
                    <p className="text-sm font-sans text-pbs-gray-700">
                      <strong>URL:</strong> <a href={draft.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-pbs-blue hover:underline">{draft.sourceUrl}</a>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      onClick={() => saveDraft(false)}
                      disabled={isSaving}
                      className="px-6 py-2 bg-pbs-gray-600 text-white font-sans hover:bg-pbs-gray-700 disabled:bg-pbs-gray-300"
                    >
                      {isSaving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                      onClick={() => saveDraft(true)}
                      disabled={isSaving}
                      className="px-6 py-2 bg-green-600 text-white font-sans hover:bg-green-700 disabled:bg-pbs-gray-300"
                    >
                      {isSaving ? 'Publishing...' : 'Publish Article'}
                    </button>
                    <button
                      onClick={() => {
                        setDraft(null)
                        setSelectedArticle(null)
                      }}
                      className="px-6 py-2 border border-pbs-gray-300 text-pbs-gray-700 font-sans hover:bg-pbs-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}