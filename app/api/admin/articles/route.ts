import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'
import { withAuth } from '@/lib/auth-middleware'

// Temporarily remove auth for debugging
export async function GET(request: NextRequest) {
  try {
    console.log('Admin articles API called')
    
    // Test database connection
    await dbConnect()
    console.log('Database connected successfully')
    
    // Test if Article model works
    console.log('Testing Article model...')
    const testCount = await Article.countDocuments({})
    console.log('Total articles in database:', testCount)
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    console.log('Fetching articles with limit:', limit, 'page:', page)

    // Try simple find first
    const simpleArticles = await (Article as any).find({}).limit(5).lean()
    console.log('Simple find result:', simpleArticles.length, 'articles')

    // Admin route - get all articles including drafts
    const articles = await Article.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])

    console.log('Aggregation result:', articles.length, 'articles')

    const total = await Article.countDocuments({})
    console.log('Total articles:', total)

    return NextResponse.json({
      success: true,
      articles: articles || [],
      testData: {
        totalCount: testCount,
        simpleCount: simpleArticles.length,
        aggregationCount: articles.length
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin articles:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}