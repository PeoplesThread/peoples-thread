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

  const fetchFeaturedArticles = async () => {
    try {
      const response = await fetch('/api/articles?featured=true&limit=6')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      }
    } catch (error) {
      console.error('Error fetching featured articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'politics':
        return 'bg-navy-100 text-thread-navy'
      case 'social-justice':
        return 'bg-primary-100 text-thread-blue'
      case 'labor':
        return 'bg-navy-200 text-thread-dark-navy'
      default:
        return 'bg-navy-50 text-navy-800'
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
      <h2 className="text-3xl font-bold mb-8 text-navy-900 font-serif border-b-2 border-thread-navy pb-2">Featured Stories</h2>
      
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-navy-600">No featured articles available yet.</p>
          <Link 
            href="/admin" 
            className="inline-block mt-4 bg-thread-navy text-white px-6 py-2 rounded-md hover:bg-thread-dark-navy transition-colors"
          >
            Create Your First Article
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/article/${article.slug}`}>
                <div className="relative h-48 bg-gray-200">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-thread-navy to-thread-dark-navy">
                      <span className="text-white text-4xl font-bold font-serif">PT</span>
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {getCategoryName(article.category)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {article.views} views
                  </span>
                </div>
                
                <Link href={`/article/${article.slug}`}>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 hover:text-leftist-red transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
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