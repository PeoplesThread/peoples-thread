import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

export async function POST(request: NextRequest) {
  try {
    // Check for API key or admin authentication
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.PBS_MONITOR_API_KEY || 'your-secret-key'
    
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { urls } = await request.json()
    
    if (!Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'URLs must be an array' },
        { status: 400 }
      )
    }

    await dbConnect()
    
    // Check which URLs already have articles
    const existingArticles = await Article.find({
      sourceUrl: { $in: urls }
    }).select('sourceUrl sourceTitle title slug')

    const existingUrls = new Set(existingArticles.map(article => article.sourceUrl))
    
    const urlStatus = urls.map(url => ({
      url,
      hasResponse: existingUrls.has(url),
      responseArticle: existingArticles.find(article => article.sourceUrl === url) || null
    }))
    
    return NextResponse.json({
      success: true,
      urlStatus,
      totalChecked: urls.length,
      existingResponses: existingArticles.length
    })
  } catch (error) {
    console.error('Error checking existing articles:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check existing articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}