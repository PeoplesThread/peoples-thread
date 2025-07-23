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
    <section className="bg-white border border-pbs-gray-200 p-8 mb-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-headline font-bold mb-4 text-pbs-gray-900">Stay Informed</h2>
        <p className="text-lg mb-6 text-pbs-gray-700 font-sans leading-relaxed">
          Subscribe to our newsletter for the latest news and analysis
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 border border-pbs-gray-300 text-pbs-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-pbs-blue focus:border-pbs-blue"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-pbs-blue text-white px-6 py-3 font-sans font-medium hover:bg-pbs-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        
        <p className="text-sm text-pbs-gray-500 font-sans mt-4">
          Join our community of informed readers. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}

export default NewsletterSignup