'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Article {
  _id: string
  title: string
  slug: string
  excerpt: string
  author: string
  publishedAt: string
  views: number
}

interface CategorySectionProps {
  title: string
  category: string
  color: string
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, category, color }) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryArticles()
  }, [category])

  const fetchCategoryArticles = async (attempt = 0) => {
    const maxRetries = 2
    const baseDelay = 1000
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`/api/articles?category=${category}&limit=4`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
        return // Success - exit retry loop
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error: any) {
      console.error(`Error fetching ${category} articles (attempt ${attempt + 1}):`, error)
      
      // If we haven't exceeded max retries, try again
      if (attempt < maxRetries && error.name !== 'AbortError') {
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Retrying ${category} articles in ${delay}ms...`)
        
        setTimeout(() => {
          fetchCategoryArticles(attempt + 1)
        }, delay)
        return
      }
      
      // All retries exhausted or timeout - just show empty state
      console.error(`Failed to fetch ${category} articles after retries`)
    } finally {
      if (attempt === 0) { // Only set loading false on the first attempt
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className={`${color} p-6 shadow-sm`}>
        <h3 className="text-lg font-headline font-bold mb-5 text-pbs-gray-900">{title}</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-pbs-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-pbs-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-pbs-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${color} p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-headline font-bold text-pbs-gray-900">{title}</h3>
        <Link 
          href={`/category/${category}`}
          className="text-sm text-pbs-blue hover:text-pbs-dark-blue font-sans font-medium"
        >
          View All →
        </Link>
      </div>
      
      {articles.length === 0 ? (
        <p className="text-pbs-gray-600 text-sm font-sans">No articles in this category yet.</p>
      ) : (
        <div className="space-y-5">
          {articles.slice(0, 3).map((article) => (
            <article key={article._id} className="border-b border-pbs-gray-100 last:border-b-0 pb-4 last:pb-0">
              <Link href={`/article/${article.slug}`}>
                <h4 className="font-sans font-semibold text-pbs-gray-900 hover:text-pbs-blue transition-colors mb-2 line-clamp-2 leading-snug">
                  {article.title}
                </h4>
              </Link>
              <p className="text-sm text-pbs-gray-600 font-sans mb-3 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-pbs-gray-500 font-sans">
                <span>By {article.author}</span>
                <div className="flex items-center space-x-2">
                  <span>{article.views} views</span>
                  <span>•</span>
                  <span>{format(new Date(article.publishedAt), 'MMM d')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategorySection