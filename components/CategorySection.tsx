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

  const fetchCategoryArticles = async () => {
    try {
      const response = await fetch(`/api/articles?category=${category}&limit=4`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      }
    } catch (error) {
      console.error(`Error fetching ${category} articles:`, error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`border-l-4 ${color} p-6 bg-white rounded-lg shadow-md`}>
        <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`border-l-4 ${color} p-6 bg-white rounded-lg shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <Link 
          href={`/category/${category}`}
          className="text-sm text-leftist-red hover:text-leftist-darkred font-medium"
        >
          View All →
        </Link>
      </div>
      
      {articles.length === 0 ? (
        <p className="text-gray-600 text-sm">No articles in this category yet.</p>
      ) : (
        <div className="space-y-4">
          {articles.slice(0, 3).map((article) => (
            <article key={article._id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
              <Link href={`/article/${article.slug}`}>
                <h4 className="font-medium text-gray-900 hover:text-leftist-red transition-colors mb-2 line-clamp-2">
                  {article.title}
                </h4>
              </Link>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
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