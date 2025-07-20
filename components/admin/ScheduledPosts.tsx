'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ScheduledPost {
  _id: string
  topic: string
  category: string
  scheduledFor: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  customPrompt?: string
  createdAt: string
  articleId?: string
  errorMessage?: string
}

const ScheduledPosts = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Form state
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('politics')
  const [scheduledFor, setScheduledFor] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [recurringInterval, setRecurringInterval] = useState('daily')

  const categories = [
    { value: 'politics', label: 'Politics & Government' },
    { value: 'social-justice', label: 'Social Justice & Civil Rights' },
    { value: 'labor', label: 'Labor & Workers\' Rights' }
  ]

  useEffect(() => {
    fetchScheduledPosts()
  }, [])

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/admin/scheduled-posts', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      toast.error('Failed to fetch scheduled posts')
    } finally {
      setLoading(false)
    }
  }

  const createScheduledPost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim() || !scheduledFor) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/scheduled-posts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          scheduledFor,
          customPrompt: customPrompt.trim() || undefined,
          recurring,
          recurringInterval: recurring ? recurringInterval : undefined
        }),
      })

      if (response.ok) {
        toast.success('Scheduled post created successfully')
        setShowCreateForm(false)
        setTopic('')
        setScheduledFor('')
        setCustomPrompt('')
        setRecurring(false)
        fetchScheduledPosts()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to create scheduled post')
      }
    } catch (error) {
      console.error('Error creating scheduled post:', error)
      toast.error('An error occurred')
    }
  }

  const deleteScheduledPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/scheduled-posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Scheduled post deleted successfully')
        fetchScheduledPosts()
      } else {
        toast.error('Failed to delete scheduled post')
      }
    } catch (error) {
      console.error('Error deleting scheduled post:', error)
      toast.error('An error occurred')
    }
  }

  const executeNow = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/scheduled-posts/${id}/execute`, {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Post execution started')
        fetchScheduledPosts()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to execute post')
      }
    } catch (error) {
      console.error('Error executing post:', error)
      toast.error('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'generating':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Scheduled Posts</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-leftist-red text-white px-4 py-2 rounded-md hover:bg-leftist-darkred transition-colors"
        >
          Schedule New Post
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Schedule New Post</h3>
            
            <form onSubmit={createScheduledPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Weekly labor news roundup, Climate policy updates"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled For *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Specific instructions for the AI generator"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring Post</span>
                </label>
                
                {recurring && (
                  <select
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leftist-red"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-leftist-red text-white rounded-md hover:bg-leftist-darkred transition-colors"
                >
                  Schedule Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduled Posts List */}
      {scheduledPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No scheduled posts yet.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-leftist-red text-white px-6 py-2 rounded-md hover:bg-leftist-darkred transition-colors"
          >
            Schedule Your First Post
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled For
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduledPosts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {post.topic}
                    </div>
                    {post.customPrompt && (
                      <div className="text-sm text-gray-500 mt-1">
                        Custom prompt provided
                      </div>
                    )}
                    {post.errorMessage && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {post.errorMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(post.scheduledFor), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {post.status === 'pending' && (
                      <button
                        onClick={() => executeNow(post._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Execute Now
                      </button>
                    )}
                    {post.articleId && (
                      <a
                        href={`/admin/edit/${post.articleId}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Article
                      </a>
                    )}
                    <button
                      onClick={() => deleteScheduledPost(post._id)}
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

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Automated Content Generation:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Posts are automatically generated and published at the scheduled time</li>
          <li>• Recurring posts will create new content based on the same topic and category</li>
          <li>• Failed generations can be retried manually</li>
          <li>• All generated content is marked as AI-generated for transparency</li>
          <li>• You can edit generated articles before they go live</li>
        </ul>
      </div>
    </div>
  )
}

export default ScheduledPosts