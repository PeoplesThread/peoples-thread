'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const AIGenerator = () => {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('politics')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedArticle, setGeneratedArticle] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const categories = [
    { value: 'politics', label: 'Politics & Government' },
    { value: 'social-justice', label: 'Social Justice & Civil Rights' },
    { value: 'labor', label: 'Labor & Workers\' Rights' }
  ]

  const generateArticle = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          customPrompt: customPrompt.trim() || undefined
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setGeneratedArticle(data.article)
        toast.success('Article generated successfully!')
      } else {
        toast.error(data.message || 'Failed to generate article')
      }
    } catch (error) {
      console.error('Error generating article:', error)
      toast.error('An error occurred while generating the article')
    } finally {
      setLoading(false)
    }
  }

  const saveArticle = async (publish: boolean = false) => {
    if (!generatedArticle) return

    setSaving(true)
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleData: generatedArticle,
          publish
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message)
        setGeneratedArticle(null)
        setTopic('')
        setCustomPrompt('')
      } else {
        toast.error(data.message || 'Failed to save article')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error('An error occurred while saving the article')
    } finally {
      setSaving(false)
    }
  }

  const editField = (field: string, value: string) => {
    setGeneratedArticle(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const editTags = (tagsString: string) => {
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setGeneratedArticle(prev => ({
      ...prev,
      tags: tagsArray
    }))
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Article Generator</h2>
      
      {/* Generation Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">Generate New Article</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic/Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Corporate tax avoidance, Police reform, Union organizing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Prompt (Optional)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific instructions for the AI (e.g., focus on recent events, include specific data points, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={generateArticle}
          disabled={loading || !topic.trim()}
          className="mt-4 bg-leftist-red text-white px-6 py-2 rounded-md hover:bg-leftist-darkred transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Article'}
        </button>
      </div>

      {/* Generated Article Preview */}
      {generatedArticle && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Generated Article</h3>
            <div className="space-x-2">
              <button
                onClick={() => saveArticle(false)}
                disabled={saving}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => saveArticle(true)}
                disabled={saving}
                className="bg-leftist-red text-white px-4 py-2 rounded-md hover:bg-leftist-darkred transition-colors disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
          
          {/* Editable Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={generatedArticle.title}
              onChange={(e) => editField('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
            />
          </div>
          
          {/* Editable Excerpt */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={generatedArticle.excerpt}
              onChange={(e) => editField('excerpt', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
            />
          </div>
          
          {/* Article Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <div className="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: generatedArticle.content }}
              />
            </div>
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={generatedArticle.tags?.join(', ') || ''}
              onChange={(e) => editTags(e.target.value)}
              placeholder="Separate tags with commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
            />
          </div>
          
          {/* Metadata */}
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>Category:</strong> {generatedArticle.category}
            </div>
            <div>
              <strong>Author:</strong> {generatedArticle.author}
            </div>
            <div>
              <strong>AI Generated:</strong> {generatedArticle.aiGenerated ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for Better AI Generation:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific with your topic (e.g., "Amazon warehouse working conditions" vs "labor issues")</li>
          <li>• Include current events or recent developments in your topic</li>
          <li>• Use custom prompts to specify tone, focus areas, or required sources</li>
          <li>• Review and edit generated content before publishing</li>
          <li>• Add relevant tags to improve discoverability</li>
        </ul>
      </div>
    </div>
  )
}

export default AIGenerator