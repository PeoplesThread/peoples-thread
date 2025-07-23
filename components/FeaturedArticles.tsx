'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface Article {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  author: string
  featuredImage?: string
  publishedAt: string
  views: number
}

const FeaturedArticles = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedArticles()
  }, [])

  const fetchFeaturedArticles = async (attempt = 0) => {
    const maxRetries = 2
    const baseDelay = 1000
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch('/api/articles?featured=true&limit=6', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
        return // Success - exit retry loop
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error(`Error fetching featured articles (attempt ${attempt + 1}):`, error)
      
      // If we haven't exceeded max retries, try again
      if (attempt < maxRetries && error.name !== 'AbortError') {
        const delay = baseDelay * Math.pow(2, attempt)
        
        setTimeout(() => {
          fetchFeaturedArticles(attempt + 1)
        }, delay)
        return
      }
      
      // All retries exhausted or timeout - just show empty state
      console.error('Failed to fetch featured articles after retries')
    } finally {
      if (attempt === 0) { // Only set loading false on the first attempt
        setLoading(false)
      }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'politics':
        return 'bg-red-50 text-pbs-politics border border-red-100'
      case 'social-justice':
        return 'bg-blue-50 text-pbs-social-justice border border-blue-100'
      case 'labor':
        return 'bg-green-50 text-pbs-labor border border-green-100'
      default:
        return 'bg-pbs-gray-100 text-pbs-gray-700 border border-pbs-gray-200'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'politics':
        return 'Politics'
      case 'social-justice':
        return 'Social Justice'
      case 'labor':
        return 'Labor Rights'
      default:
        return category
    }
  }

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Featured Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-headline font-bold mb-8 text-pbs-gray-900 border-b border-pbs-gray-200 pb-3">
        Featured Stories
      </h2>
      
      {articles.length === 0 ? (
        <div className="text-center py-12 bg-white border border-pbs-gray-200">
          <p className="text-pbs-gray-600 font-sans">No featured articles available yet.</p>
          <Link 
            href="/admin" 
            className="inline-block mt-4 bg-pbs-blue text-white px-6 py-2 font-sans font-medium hover:bg-pbs-dark-blue transition-colors"
          >
            Create Your First Article
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article._id} className="bg-white border border-pbs-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/article/${article.slug}`}>
                <div className="relative h-48 bg-pbs-gray-100">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pbs-blue">
                      <span className="text-white text-3xl font-headline font-bold">PT</span>
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs font-sans font-medium ${getCategoryColor(article.category)}`}>
                    {getCategoryName(article.category)}
                  </span>
                  <span className="text-xs text-pbs-gray-500 font-sans">
                    {article.views} views
                  </span>
                </div>
                
                <Link href={`/article/${article.slug}`}>
                  <h3 className="text-lg font-headline font-bold mb-3 text-pbs-gray-900 hover:text-pbs-blue transition-colors line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                </Link>
                
                <p className="text-pbs-gray-600 text-sm font-sans mb-4 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-pbs-gray-500 font-sans">
                  <span>By {article.author}</span>
                  <span>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedArticles