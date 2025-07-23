'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import AdBanner from '@/components/AdBanner'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

interface Article {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  author: string
  featuredImage?: string
  publishedAt: string
  views: number
  tags?: string[]
}

interface RelatedArticle {
  _id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  views: number
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticle()
  }, [params.slug])

  const fetchArticle = async () => {
    try {
      console.log('Fetching article:', params.slug)
      
      const response = await fetch(`/api/articles/${params.slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found')
        } else {
          setError('Failed to load article')
        }
        return
      }
      
      const data = await response.json()
      setArticle(data.article)
      
      // Fetch related articles
      if (data.article.category) {
        const relatedResponse = await fetch(`/api/articles?category=${data.article.category}&limit=4`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          const filtered = relatedData.articles
            .filter((a: any) => a.slug !== params.slug)
            .slice(0, 3)
          setRelatedArticles(filtered)
        }
      }
      
    } catch (error) {
      console.error('Error fetching article:', error)
      setError('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-pbs-bg-light min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 rounded mb-6"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="bg-pbs-bg-light min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/" className="bg-pbs-blue text-white px-6 py-2 font-medium hover:bg-pbs-dark-blue transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'politics':
        return 'bg-red-50 text-pbs-politics border border-red-100'
      case 'social-justice':
        return 'bg-blue-50 text-pbs-social-justice border border-blue-100'
      case 'labor':
        return 'bg-green-50 text-pbs-labor border border-green-100'
      case 'environment':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      case 'economy':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-100'
      case 'healthcare':
        return 'bg-pink-50 text-pink-700 border border-pink-100'
      case 'education':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-100'
      case 'technology':
        return 'bg-purple-50 text-purple-700 border border-purple-100'
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
      case 'environment':
        return 'Environment'
      case 'economy':
        return 'Economy'
      case 'healthcare':
        return 'Healthcare'
      case 'education':
        return 'Education'
      case 'technology':
        return 'Technology'
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* PBS-style header with category and publication info */}
      <div className="bg-pbs-gray-50 border-b border-pbs-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="mb-2">
            <ol className="flex items-center space-x-2 text-sm text-pbs-gray-600 font-sans">
              <li><Link href="/" className="hover:text-pbs-blue transition-colors">Peoples Thread</Link></li>
              <li className="text-pbs-gray-400">›</li>
              <li><Link href={`/category/${article.category}`} className="hover:text-pbs-blue transition-colors">{getCategoryName(article.category)}</Link></li>
            </ol>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Link href={`/category/${article.category}`}>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-sans font-semibold uppercase tracking-wide ${getCategoryColor(article.category)}`}>
                {getCategoryName(article.category)}
              </span>
            </Link>
            <span className="text-pbs-gray-400 text-sm">•</span>
            <time dateTime={article.publishedAt} className="text-sm text-pbs-gray-600 font-sans">
              {format(new Date(article.publishedAt!), 'MMM d, yyyy h:mm a')} EDT
            </time>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header - PBS NewsHour style */}
        <header className="py-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-pbs-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-pbs-gray-200">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pbs-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-sans font-semibold text-sm">
                    {article.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-sans font-semibold text-pbs-gray-900">
                    By {article.author}
                  </p>
                  <p className="text-xs text-pbs-gray-600 font-sans">
                    Peoples Thread Correspondent
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-pbs-gray-500 font-sans">
              <span>{article.views.toLocaleString()} views</span>
            </div>
          </div>
          
          {article.excerpt && (
            <p className="text-xl text-pbs-gray-700 leading-relaxed font-sans mb-8 font-light">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-8">
            <div className="relative h-64 md:h-96 bg-pbs-gray-100">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          </div>
        )}

        {/* Top Article Ad - After header, before content */}
        <AdBanner 
          slot="article-top-banner" 
          format="horizontal"
        />

        {/* Article Content - PBS NewsHour style with Markdown support */}
        <article className="mb-8">
          <div className="article-content prose prose-lg max-w-none prose-headings:font-headline prose-headings:text-pbs-gray-900 prose-p:text-pbs-gray-800 prose-p:font-sans prose-p:leading-relaxed prose-p:text-lg prose-strong:text-pbs-gray-900 prose-a:text-pbs-blue hover:prose-a:text-pbs-dark-blue prose-blockquote:border-l-pbs-blue prose-blockquote:bg-pbs-gray-50 prose-code:bg-pbs-gray-100 prose-code:text-pbs-gray-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-headline font-bold mt-8 mb-6 text-pbs-gray-900 border-b border-pbs-gray-200 pb-3">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-headline font-bold mt-8 mb-4 text-pbs-gray-900">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-headline font-semibold mt-6 mb-3 text-pbs-gray-900">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-6 text-pbs-gray-800 leading-relaxed font-sans text-lg">
                    {children}
                  </p>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-pbs-blue bg-pbs-gray-50 pl-6 py-4 my-6 italic">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-pbs-gray-700 font-sans">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-pbs-gray-700 font-sans">
                    {children}
                  </ol>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-pbs-gray-900">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-pbs-gray-700">
                    {children}
                  </em>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-pbs-blue hover:text-pbs-dark-blue underline font-medium"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="my-8 border-pbs-gray-200" />
                ),
                code: ({ children, className }) => {
                  const isInline = !className
                  if (isInline) {
                    return (
                      <code className="bg-pbs-gray-100 text-pbs-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <pre className="bg-pbs-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                      <code className="text-pbs-gray-800 text-sm font-mono">
                        {children}
                      </code>
                    </pre>
                  )
                }
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Tags - PBS style */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8 py-6 border-t border-pbs-gray-200">
            <h3 className="text-base font-sans font-semibold mb-4 text-pbs-gray-900">Go Deeper</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-pbs-gray-100 text-pbs-gray-700 text-sm font-sans hover:bg-pbs-blue hover:text-white transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}



        {/* Share Buttons - PBS style */}
        <div className="mb-8 py-6 border-t border-b border-pbs-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-sans font-semibold text-pbs-gray-900">Share</h3>
            <div className="flex items-center space-x-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/article/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-pbs-gray-100 hover:bg-pbs-blue hover:text-white transition-colors text-pbs-gray-600 font-sans text-sm font-medium"
                title="Share on Facebook"
              >
                f
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/article/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-pbs-gray-100 hover:bg-pbs-blue hover:text-white transition-colors text-pbs-gray-600 font-sans text-sm font-medium"
                title="Share on Twitter"
              >
                𝕏
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/article/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-pbs-gray-100 hover:bg-pbs-blue hover:text-white transition-colors text-pbs-gray-600 font-sans text-sm font-medium"
                title="Share on LinkedIn"
              >
                in
              </a>
              <button
                onClick={() => {
                  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/article/${article.slug}`
                  navigator.clipboard.writeText(url)
                  alert('Link copied to clipboard!')
                }}
                className="flex items-center justify-center w-10 h-10 bg-pbs-gray-100 hover:bg-pbs-blue hover:text-white transition-colors text-pbs-gray-600 font-sans text-sm font-medium"
                title="Copy Link"
              >
                🔗
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles - PBS NewsHour style */}
        {relatedArticles.length > 0 && (
          <section className="mb-8 py-8 border-t border-pbs-gray-200">
            <h3 className="text-2xl font-headline font-bold mb-8 text-pbs-gray-900">
              Related
            </h3>
            <div className="space-y-6">
              {relatedArticles.map((relatedArticle) => (
                <article key={relatedArticle._id} className="border-b border-pbs-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <Link href={`/article/${relatedArticle.slug}`} className="group">
                    <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                      <div className="flex-1">
                        <h4 className="font-headline font-bold text-xl text-pbs-gray-900 group-hover:text-pbs-blue transition-colors mb-3 leading-tight">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-pbs-gray-700 font-sans mb-3 leading-relaxed">
                          {relatedArticle.excerpt}
                        </p>
                        <div className="flex items-center space-x-3 text-sm text-pbs-gray-500 font-sans">
                          <span>{format(new Date(relatedArticle.publishedAt!), 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <span>{relatedArticle.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Listen Section - PBS style */}
        <div className="mb-8 py-6 border-t border-pbs-gray-200">
          <h3 className="text-base font-sans font-semibold mb-4 text-pbs-gray-900">Listen to this Segment</h3>
          <div className="bg-pbs-gray-50 p-6 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-pbs-blue rounded-full flex items-center justify-center">
                <span className="text-white text-xl">▶</span>
              </div>
              <div>
                <p className="font-sans font-medium text-pbs-gray-900">Audio Player</p>
                <p className="text-sm text-pbs-gray-600 font-sans">Listen to the full segment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Ad - Better placement */}
        <div className="mb-8">
          <AdBanner 
            slot="article-sidebar" 
            format="rectangle"
          />
        </div>

        {/* Support Message - PBS style */}
        <div className="mb-8 bg-pbs-blue text-white p-8 rounded-lg">
          <div className="text-center">
            <h3 className="text-2xl font-headline font-bold mb-4">Support Provided By</h3>
            <p className="font-sans text-lg mb-4">
              Peoples Thread is supported by readers like you who believe in independent journalism.
            </p>
            <button className="bg-white text-pbs-blue px-6 py-3 font-sans font-semibold hover:bg-pbs-gray-100 transition-colors">
              Support Peoples Thread
            </button>
          </div>
        </div>

        {/* Bottom Ad - After all content */}
        <AdBanner 
          slot="article-bottom" 
          format="horizontal"
        />
      </div>
    </div>
  )
}