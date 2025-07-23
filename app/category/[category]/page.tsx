import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import AdBanner from '@/components/AdBanner'
import Breadcrumb from '@/components/Breadcrumb'

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    page?: string
  }
}

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

const VALID_CATEGORIES = ['politics', 'social-justice', 'labor', 'environment', 'economy', 'healthcare']

// Server-side data fetching
async function getCategoryArticles(category: string, page: number = 1) {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3002'
    
    const response = await fetch(`${baseUrl}/api/articles?category=${category}&limit=12&page=${page}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching category articles:', error)
    return {
      articles: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  if (!VALID_CATEGORIES.includes(params.category)) {
    notFound()
  }

  const page = parseInt(searchParams?.page || '1')
  const { articles, pagination } = await getCategoryArticles(params.category, page)

  const categoryInfo = {
    'politics': {
      name: 'Politics',
      description: 'Political coverage and analysis from a working-class perspective.',
      color: 'bg-red-50 text-pbs-politics border border-red-100',
      bgColor: 'bg-white',
      borderColor: 'border-l-4 border-pbs-politics'
    },
    'social-justice': {
      name: 'Social Justice',
      description: 'Stories on civil rights, equality, and social progress.',
      color: 'bg-blue-50 text-pbs-social-justice border border-blue-100',
      bgColor: 'bg-white',
      borderColor: 'border-l-4 border-pbs-social-justice'
    },
    'labor': {
      name: 'Labor',
      description: 'Coverage of workers\' rights, unions, and labor movements.',
      color: 'bg-green-50 text-pbs-labor border border-green-100',
      bgColor: 'bg-white',
      borderColor: 'border-l-4 border-pbs-labor'
    },
    'environment': {
      name: 'Environment',
      description: 'Environmental justice and climate change coverage.',
      color: 'bg-green-50 text-green-700 border border-green-100',
      bgColor: 'bg-white',
      borderColor: 'border-l-4 border-green-500'
    },
    'economy': {
      name: 'Economy',
      description: 'Economic analysis from a working-class perspective.',
      color: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
      bgColor: 'bg-white',
      borderColor: 'border-l-4 border-yellow-500'
    },
    'healthcare': {
      name: 'Healthcare',
      description: 'Healthcare access and policy coverage.',
      color: 'bg-purple-50 text-purple-700 border border-purple-100',
      bgColor: 'bg-white',
      borderColor: 'border-l-4 border-purple-500'
    }
  }

  const category = categoryInfo[params.category as keyof typeof categoryInfo]

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb - PBS style */}
        <Breadcrumb 
          items={[
            { name: 'Home', href: '/' },
            { name: category.name }
          ]} 
        />

        {/* Category Header - PBS NewsHour style */}
        <header className="mb-8">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-1 h-8 ${category.borderColor.replace('border-l-4 border-', 'bg-')}`}></div>
              <span className="text-xs text-gray-500 font-sans uppercase tracking-wide">
                {category.name}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 mb-4 leading-tight">
              {category.name}
            </h1>
            <p className="text-lg text-gray-600 font-sans leading-relaxed max-w-3xl">
              {category.description}
            </p>
          </div>
        </header>

      {/* Ad Banner */}
      <AdBanner slot="category-top" />

        {/* Articles Grid - PBS NewsHour style */}
        {articles.length === 0 ? (
          <div className="text-center py-12 bg-white border border-pbs-gray-200">
            <h2 className="text-2xl font-headline font-semibold text-pbs-gray-900 mb-4">No articles yet</h2>
            <p className="text-pbs-gray-600 font-sans mb-6">
              We're working on bringing you the latest {category.name.toLowerCase()} content.
            </p>
            <Link
              href="/"
              className="bg-pbs-blue text-white px-6 py-3 font-sans font-medium hover:bg-pbs-dark-blue transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
                      <span className={`px-2 py-1 text-xs font-sans font-medium ${category.color}`}>
                        {category.name}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-pbs-gray-500 font-sans">
                        <span>{article.views} views</span>
                      </div>
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
                      <span>{format(new Date(article.publishedAt!), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination - PBS style */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mb-8">
                {page > 1 && (
                  <Link
                    href={`/category/${params.category}?page=${page - 1}`}
                    className="px-4 py-2 bg-pbs-gray-200 text-pbs-gray-700 font-sans font-medium hover:bg-pbs-gray-300 transition-colors"
                  >
                    Previous
                  </Link>
                )}
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1
                    const isActive = pageNum === page
                    
                    return (
                      <Link
                        key={pageNum}
                        href={`/category/${params.category}?page=${pageNum}`}
                        className={`px-3 py-2 text-sm font-sans font-medium ${
                          isActive
                            ? 'bg-pbs-blue text-white'
                            : 'bg-pbs-gray-200 text-pbs-gray-700 hover:bg-pbs-gray-300'
                        } transition-colors`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                </div>
                
                {page < pagination.pages && (
                  <Link
                    href={`/category/${params.category}?page=${page + 1}`}
                    className="px-4 py-2 bg-pbs-gray-200 text-pbs-gray-700 font-sans font-medium hover:bg-pbs-gray-300 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}

            {/* Ad Banner */}
            <AdBanner slot="category-bottom" />
          </>
        )}

        {/* Category Info - PBS style */}
        <div className="mt-12 bg-white border border-pbs-gray-200 p-6">
          <h2 className="text-xl font-headline font-semibold mb-4 text-pbs-gray-900">About {category.name}</h2>
          <p className="text-pbs-gray-700 font-sans mb-4 leading-relaxed">
            Our {category.name.toLowerCase()} coverage provides in-depth analysis and reporting on the issues that matter most to working families and communities.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-pbs-gray-100 text-pbs-gray-700 text-sm font-sans border border-pbs-gray-200">Independent Journalism</span>
            <span className="px-3 py-1 bg-pbs-gray-100 text-pbs-gray-700 text-sm font-sans border border-pbs-gray-200">Working Class Focus</span>
            <span className="px-3 py-1 bg-pbs-gray-100 text-pbs-gray-700 text-sm font-sans border border-pbs-gray-200">Progressive Analysis</span>
          </div>
        </div>
      </div>
    </div>
  )
}