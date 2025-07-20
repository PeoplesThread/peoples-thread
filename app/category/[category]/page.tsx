import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import AdBanner from '@/components/AdBanner'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    page?: string
  }
}

const VALID_CATEGORIES = ['politics', 'social-justice', 'labor']

async function getCategoryArticles(category: string, page: number = 1, limit: number = 12) {
  try {
    await dbConnect()
    
    const skip = (page - 1) * limit
    
    const articles = await Article.aggregate([
      { $match: { category, published: true } },
      { $sort: { publishedAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])

    const total = await Article.countDocuments({
      category,
      published: true
    })

    return {
      articles: articles.map(article => ({
        ...article,
        _id: article._id.toString(),
        publishedAt: article.publishedAt?.toISOString(),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching category articles:', error)
    return {
      articles: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    }
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  if (!VALID_CATEGORIES.includes(params.category)) {
    return {
      title: 'Category Not Found - Progressive Voice'
    }
  }

  const categoryNames = {
    'politics': 'Politics & Government',
    'social-justice': 'Social Justice & Civil Rights',
    'labor': 'Labor & Workers\' Rights'
  }

  const categoryName = categoryNames[params.category as keyof typeof categoryNames]

  return {
    title: `${categoryName} - Progressive Voice`,
    description: `Latest ${categoryName.toLowerCase()} news and analysis from a progressive leftist perspective. Fighting for justice, equality, and workers' rights.`,
    keywords: `${categoryName.toLowerCase()}, progressive news, leftist analysis, social justice`
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  if (!VALID_CATEGORIES.includes(params.category)) {
    notFound()
  }

  const page = parseInt(searchParams.page || '1')
  const { articles, pagination } = await getCategoryArticles(params.category, page)

  const categoryInfo = {
    'politics': {
      name: 'Politics & Government',
      description: 'Progressive political analysis challenging corporate power and advocating for working-class interests.',
      color: 'bg-red-100 text-red-800',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    'social-justice': {
      name: 'Social Justice & Civil Rights',
      description: 'Fighting systemic oppression and inequality while centering marginalized voices and experiences.',
      color: 'bg-blue-100 text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    'labor': {
      name: 'Labor & Workers\' Rights',
      description: 'Supporting workers\' rights, union organizing, and the fight against corporate exploitation.',
      color: 'bg-green-100 text-green-800',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  }

  const category = categoryInfo[params.category as keyof typeof categoryInfo]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><Link href="/" className="hover:text-leftist-red">Home</Link></li>
          <li>/</li>
          <li className="text-gray-900">{category.name}</li>
        </ol>
      </nav>

      {/* Category Header */}
      <header className={`${category.bgColor} ${category.borderColor} border-l-4 p-8 rounded-lg mb-8`}>
        <div className="max-w-3xl">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color} mb-4`}>
            {category.name}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {category.name}
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            {category.description}
          </p>
        </div>
      </header>

      {/* Ad Banner */}
      <AdBanner slot="category-top" />

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No articles yet</h2>
          <p className="text-gray-600 mb-6">
            We're working on bringing you the latest {category.name.toLowerCase()} content.
          </p>
          <Link
            href="/"
            className="bg-leftist-red text-white px-6 py-3 rounded-md hover:bg-leftist-darkred transition-colors"
          >
            Browse All Articles
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-leftist-red to-leftist-darkred">
                        <span className="text-white text-4xl font-bold">PV</span>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      {category.name}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{article.views} views</span>
                      {article.aiGenerated && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            AI
                          </span>
                        </>
                      )}
                    </div>
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
                    <span>{format(new Date(article.publishedAt!), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mb-8">
              {page > 1 && (
                <Link
                  href={`/category/${params.category}?page=${page - 1}`}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
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
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? 'bg-leftist-red text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
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

      {/* Category Info */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">About {category.name}</h2>
        <p className="text-gray-700 mb-4">
          Our {category.name.toLowerCase()} coverage focuses on progressive analysis and advocacy. 
          We believe in challenging power structures, amplifying marginalized voices, and fighting for systemic change.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Progressive Analysis</span>
          <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Leftist Perspective</span>
          <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Social Justice</span>
          <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Workers' Rights</span>
        </div>
      </div>
    </div>
  )
}