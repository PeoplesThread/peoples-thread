import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import AdBanner from '@/components/AdBanner'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

async function getArticle(slug: string) {
  try {
    await dbConnect()
    
    const articles = await Article.aggregate([
      { $match: { slug, published: true } }
    ])
    const article = articles[0]

    if (!article) {
      return null
    }

    // Increment view count
    await (Article as any).updateOne({ _id: article._id }, { $inc: { views: 1 } })

    return {
      ...article,
      _id: article._id.toString(),
      publishedAt: article.publishedAt?.toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

async function getRelatedArticles(category: string, currentSlug: string) {
  try {
    await dbConnect()
    
    const articles = await Article.aggregate([
      { $match: { category, published: true, slug: { $ne: currentSlug } } },
      { $sort: { publishedAt: -1 } },
      { $limit: 3 },
      { $project: { title: 1, slug: 1, excerpt: 1, publishedAt: 1, views: 1 } }
    ])

    return articles.map(article => ({
      ...article,
      _id: article._id.toString(),
      publishedAt: article.publishedAt?.toISOString()
    }))
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return []
  }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found - Progressive Voice'
    }
  }

  return {
    title: `${article.title} - Progressive Voice`,
    description: article.excerpt,
    keywords: article.tags?.join(', '),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: article.featuredImage ? [article.featuredImage] : undefined
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug)
  
  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(article.category, article.slug)

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

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'politics':
        return 'Politics & Government'
      case 'social-justice':
        return 'Social Justice'
      case 'labor':
        return 'Labor Rights'
      default:
        return category
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-leftist-red">Home</Link></li>
            <li>/</li>
            <li><Link href={`/category/${article.category}`} className="hover:text-leftist-red">{getCategoryName(article.category)}</Link></li>
            <li>/</li>
            <li className="text-gray-900 truncate">{article.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <Link href={`/category/${article.category}`}>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                {getCategoryName(article.category)}
              </span>
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4">
              <span>By <strong className="text-gray-900">{article.author}</strong></span>
              {article.aiGenerated && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  AI Generated
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>{article.views} views</span>
              <span>•</span>
              <time dateTime={article.publishedAt}>
                {format(new Date(article.publishedAt!), 'MMMM d, yyyy')}
              </time>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-8">
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Ad Banner */}
        <AdBanner slot="article-top" />

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-8">
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ad Banner */}
        <AdBanner slot="article-middle" />

        {/* Share Buttons */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Share this article</h3>
          <div className="flex space-x-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/article/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/article/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              Share on Facebook
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(`${process.env.NEXTAUTH_URL}/article/${article.slug}`)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <article key={relatedArticle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/article/${relatedArticle.slug}`}>
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 hover:text-leftist-red transition-colors mb-2 line-clamp-2">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {relatedArticle.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{relatedArticle.views} views</span>
                        <span>{format(new Date(relatedArticle.publishedAt!), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Ad */}
        <AdBanner slot="article-bottom" />
      </div>
    </div>
  )
}