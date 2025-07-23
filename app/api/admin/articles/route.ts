import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'
import { withAuth } from '@/lib/auth-middleware'
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

// Helper function to write articles to file
function writeArticlesToFile(articles: any[]) {
  try {
    fs.writeFileSync(articlesFilePath, JSON.stringify(articles, null, 2))
    return true
  } catch (error) {
    console.error('Error writing articles file:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Admin articles API called')
    
    // Try database first, fallback to file system
    try {
      await Promise.race([
        dbConnect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 3000)
        )
      ])
      
      console.log('Database connected successfully')
      
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '50')
      const page = parseInt(searchParams.get('page') || '1')
      const skip = (page - 1) * limit

      const [articles, total] = await Promise.all([
        Article.aggregate([
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ]),
        Article.countDocuments({})
      ])

      return NextResponse.json({
        success: true,
        articles: articles || [],
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
      const articles = readArticlesFromFile()
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '50')
      const page = parseInt(searchParams.get('page') || '1')
      const skip = (page - 1) * limit
      
      const paginatedArticles = articles.slice(skip, skip + limit)
      
      return NextResponse.json({
        success: true,
        articles: paginatedArticles,
        pagination: {
          page,
          limit,
          total: articles.length,
          pages: Math.ceil(articles.length / limit)
        },
        source: 'filesystem'
      })
    }
    
  } catch (error: any) {
    console.error('Error fetching admin articles:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch articles',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating new article...')
    
    const body = await request.json()
    console.log('Article data received:', body)
    
    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }
    
    // Convert tags string to array if needed
    if (typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    }
    
    // Set publishedAt if publishing
    if (body.published && !body.publishedAt) {
      body.publishedAt = new Date()
    }
    
    // Set default author if not provided
    if (!body.author) {
      body.author = 'Progressive Voice Editorial Team'
    }
    
    // Add timestamps and ID
    const now = new Date()
    const articleData = {
      ...body,
      _id: Date.now().toString(), // Simple ID for file system
      createdAt: now,
      updatedAt: now,
      views: 0,
      likes: 0
    }
    
    console.log('Processed article data:', articleData)
    
    // Try database first, fallback to file system
    try {
      await Promise.race([
        dbConnect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 3000)
        )
      ])
      
      console.log('Database connected, saving to MongoDB')
      const article = new Article(articleData)
      await article.save()
      
      return NextResponse.json({
        success: true,
        article: article,
        message: 'Article created successfully',
        source: 'database'
      })
      
    } catch (dbError) {
      console.log('Database unavailable, saving to file system')
      
      // Fallback to file system
      const articles = readArticlesFromFile()
      
      // Check for duplicate slug
      if (articles.some((a: any) => a.slug === articleData.slug)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Article with this slug already exists'
          },
          { status: 400 }
        )
      }
      
      articles.unshift(articleData) // Add to beginning
      
      if (writeArticlesToFile(articles)) {
        return NextResponse.json({
          success: true,
          article: articleData,
          message: 'Article created successfully',
          source: 'filesystem'
        })
      } else {
        throw new Error('Failed to save article to file system')
      }
    }
    
  } catch (error: any) {
    console.error('Error creating article:', error)
    
    let errorMessage = 'Failed to create article'
    let statusCode = 500
    
    if (error.code === 11000) {
      errorMessage = 'Article with this slug already exists'
      statusCode = 400
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Invalid article data: ' + Object.values(error.errors).map((e: any) => e.message).join(', ')
      statusCode = 400
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    )
  }
}