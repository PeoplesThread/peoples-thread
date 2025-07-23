import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'
import fs from 'fs'
import path from 'path'

const articlesFilePath = path.join(process.cwd(), 'data', 'articles.json')

// Helper function to read articles from file
function readArticlesFromFile() {
  try {
    if (fs.existsSync(articlesFilePath)) {
      const data = fs.readFileSync(articlesFilePath, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading articles file:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Try database first, fallback to file system
    try {
      await Promise.race([
        dbConnect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 3000)
        )
      ])
      
      console.log('Database connected, fetching from MongoDB')
      
      let query: any = { published: true }
      
      if (category) {
        query.category = category
      }
      
      if (featured === 'true') {
        query.featured = true
      }

      const [articles, total] = await Promise.all([
        Article.aggregate([
          { $match: query },
          { $sort: { publishedAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ]),
        Article.countDocuments(query)
      ])

      return NextResponse.json({
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        source: 'database'
      })
      
    } catch (dbError) {
      console.log('Database unavailable, using file system fallback')
      
      // Fallback to file system
      let articles = readArticlesFromFile()
      
      // Filter articles
      articles = articles.filter((article: any) => {
        if (!article.published) return false
        if (category && article.category !== category) return false
        if (featured === 'true' && !article.featured) return false
        return true
      })
      
      // Sort by publishedAt (newest first)
      articles.sort((a: any, b: any) => {
        const dateA = new Date(a.publishedAt || a.createdAt)
        const dateB = new Date(b.publishedAt || b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      // Paginate
      const total = articles.length
      const paginatedArticles = articles.slice(skip, skip + limit)
      
      return NextResponse.json({
        articles: paginatedArticles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        source: 'filesystem'
      })
    }
    
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    
    return NextResponse.json(
      { message: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { title, content, excerpt, category, tags, author, featuredImage, published, featured } = body

    if (!title || !content || !excerpt || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const article = new Article({
      title,
      slug,
      content,
      excerpt,
      category,
      tags: tags || [],
      author: author || 'Progressive Voice Editorial Team',
      featuredImage,
      published: published || false,
      featured: featured || false,
      publishedAt: published ? new Date() : undefined
    })

    await article.save()

    return NextResponse.json(
      { message: 'Article created successfully', article },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating article:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Article with this title already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}