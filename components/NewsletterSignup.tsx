'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast.success('Successfully subscribed to our newsletter!')
        setEmail('')
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to subscribe')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-r from-leftist-red to-leftist-darkred text-white p-8 rounded-lg mb-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Informed</h2>
        <p className="text-xl mb-6 opacity-90">
          Get the latest progressive news and analysis delivered straight to your inbox
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-leftist-red px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        
        <p className="text-sm opacity-75 mt-4">
          Join thousands of readers fighting for justice and equality. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}

export default NewsletterSignup