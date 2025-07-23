import { NextRequest, NextResponse } from 'next/server'
import { monitorPBSAndCreateArticles } from '@/lib/pbsMonitor'

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

    console.log('Starting PBS monitoring process...')
    const result = await monitorPBSAndCreateArticles()
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `PBS monitoring completed successfully. Created ${result.articlesCreated}/${result.articlesProcessed} articles.`
        : `PBS monitoring completed with errors. Created ${result.articlesCreated}/${result.articlesProcessed} articles.`,
      details: {
        articlesProcessed: result.articlesProcessed,
        articlesCreated: result.articlesCreated,
        errors: result.errors
      }
    })
  } catch (error) {
    console.error('Error in PBS monitoring API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to monitor PBS articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PBS Monitor API',
    usage: 'Send POST request with Bearer token to trigger monitoring',
    status: 'Active'
  })
}