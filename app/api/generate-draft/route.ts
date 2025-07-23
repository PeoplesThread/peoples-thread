import { NextRequest, NextResponse } from 'next/server'
import { generateLeftistResponse } from '@/lib/pbsMonitor'

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

    const body = await request.json()
    const { pbsArticle } = body

    if (!pbsArticle || !pbsArticle.title || !pbsArticle.url) {
      return NextResponse.json(
        { error: 'Invalid PBS article data provided' },
        { status: 400 }
      )
    }

    console.log(`Generating draft article for: "${pbsArticle.title}"`)
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          details: 'Please set OPENAI_API_KEY in your environment variables'
        },
        { status: 500 }
      )
    }

    // Generate leftist response
    const draftArticle = await generateLeftistResponse(pbsArticle)
    
    return NextResponse.json({
      success: true,
      message: 'Draft article generated successfully',
      draft: {
        ...draftArticle,
        sourceUrl: pbsArticle.url,
        sourceTitle: pbsArticle.title,
        sourcePublishedDate: pbsArticle.publishedDate
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating draft article:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate draft article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Draft Generation API',
    usage: 'Send POST request with PBS article data to generate a draft',
    status: 'Active'
  })
}