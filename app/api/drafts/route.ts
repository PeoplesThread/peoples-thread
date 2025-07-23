import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

export async function GET(request: NextRequest) {
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

    await dbConnect()
    
    // Get all unpublished articles (drafts)
    const drafts = await Article.find({ 
      published: false 
    }).sort({ 
      createdAt: -1 
    }).select('title slug excerpt category tags sourceUrl sourceTitle aiGenerated createdAt')
    
    return NextResponse.json({
      success: true,
      drafts: drafts.map(draft => ({
        id: draft._id,
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        category: draft.category,
        tags: draft.tags,
        sourceUrl: draft.sourceUrl,
        sourceTitle: draft.sourceTitle,
        aiGenerated: draft.aiGenerated,
        createdAt: draft.createdAt
      })),
      count: drafts.length
    })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch drafts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get('id')

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()
    
    const deletedDraft = await Article.findByIdAndDelete(draftId)
    
    if (!deletedDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}