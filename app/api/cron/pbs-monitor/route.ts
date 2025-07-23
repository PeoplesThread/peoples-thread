import { NextRequest, NextResponse } from 'next/server'
import { monitorPBSAndCreateArticles } from '@/lib/pbsMonitor'

// This endpoint can be called by cron services like Vercel Cron or external cron jobs
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron service
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Cron job triggered: PBS monitoring')
    const result = await monitorPBSAndCreateArticles()
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `PBS monitoring cron job completed successfully. Created ${result.articlesCreated}/${result.articlesProcessed} articles.`
        : `PBS monitoring cron job completed with errors. Created ${result.articlesCreated}/${result.articlesProcessed} articles.`,
      timestamp: new Date().toISOString(),
      details: {
        articlesProcessed: result.articlesProcessed,
        articlesCreated: result.articlesCreated,
        errors: result.errors
      }
    })
  } catch (error) {
    console.error('Error in PBS monitoring cron job:', error)
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}