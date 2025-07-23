import { NextRequest, NextResponse } from 'next/server'
import { fetchPBSArticles } from '@/lib/pbsMonitor'

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

    console.log('Fetching PBS articles for preview...')
    const articles = await fetchPBSArticles()
    
    return NextResponse.json({
      success: true,
      message: `Found ${articles.length} relevant PBS articles`,
      articles: articles.map(article => ({
        title: article.title,
        url: article.url,
        summary: article.summary,
        publishedDate: article.publishedDate,
        contentLength: article.content.length
      })),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching PBS articles:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch PBS articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PBS Fetch API',
    usage: 'Send POST request with Bearer token to fetch PBS articles',
    status: 'Active'
  })
}