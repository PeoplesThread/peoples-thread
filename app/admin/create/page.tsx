'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'
import LoginForm from '@/components/admin/LoginForm'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

const CreateArticle = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth()
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('politics')
  const [tags, setTags] = useState('')
  const [author, setAuthor] = useState('Progressive Voice Editorial Team')
  const [featuredImage, setFeaturedImage] = useState('')
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  const categories = [
    { value: 'politics', label: 'Politics & Government' },
    { value: 'social-justice', label: 'Social Justice & Civil Rights' },
    { value: 'labor', label: 'Labor & Workers\' Rights' }
  ]

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image'
  ]

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean = false) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          excerpt: excerpt.trim(),
          category,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          author: author.trim(),
          featuredImage: featuredImage.trim() || undefined,
          published: shouldPublish,
          featured
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(shouldPublish ? 'Article published successfully!' : 'Article saved as draft!')
        router.push('/admin')
      } else {
        toast.error(data.message || 'Failed to save article')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error('An error occurred while saving the article')
    } finally {
      setLoading(false)
    }
  }

  const generateExcerpt = () => {
    if (content) {
      // Strip HTML tags and get first 200 characters
      const textContent = content.replace(/<[^>]*>/g, '')
      const excerpt = textContent.substring(0, 200).trim()
      setExcerpt(excerpt + (textContent.length > 200 ? '...' : ''))
    }
  }

  const handleLogin = () => {
    checkAuth()
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-thread-navy transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create New Article
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Write and publish progressive news content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 lg:p-8">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling article title"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-thread-navy focus:border-transparent transition-all duration-200 text-sm"
                required
                disabled={loading}
              />
            </div>

            {/* Category and Author */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-thread-navy focus:border-transparent transition-all duration-200 text-sm"
                  required
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-thread-navy focus:border-transparent transition-all duration-200 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL (Optional)
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                disabled={loading}
              />
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <div className="border border-gray-300 rounded-md">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write your article content here..."
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Excerpt *
                </label>
                <button
                  type="button"
                  onClick={generateExcerpt}
                  className="text-sm text-leftist-red hover:text-leftist-darkred"
                  disabled={loading}
                >
                  Auto-generate from content
                </button>
              </div>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the article (150-300 characters)"
                rows={3}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                required
                disabled={loading}
              />
              <div className="text-sm text-gray-500 mt-1">
                {excerpt.length}/300 characters
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separate tags with commas (e.g., progressive, politics, workers rights)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                disabled={loading}
              />
            </div>

            {/* Options */}
            <div className="mb-8">
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Article</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-700 space-y-4 sm:space-y-0">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-thread-navy transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Save as Draft
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-thread-navy to-blue-600 hover:from-thread-navy hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-thread-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Publish Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Writing Tips */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Writing Tips for Progressive Content
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span><strong>Lead with impact:</strong> Start with how the issue affects working people and marginalized communities</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span><strong>Provide context:</strong> Explain systemic issues and root causes, not just symptoms</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span><strong>Include voices:</strong> Quote activists, affected communities, and progressive experts</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span><strong>Offer solutions:</strong> Highlight organizing efforts, policy alternatives, and calls to action</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span><strong>Challenge power:</strong> Question corporate narratives and establishment talking points</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span><strong>Use inclusive language:</strong> Center marginalized voices and avoid harmful stereotypes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CreateArticle