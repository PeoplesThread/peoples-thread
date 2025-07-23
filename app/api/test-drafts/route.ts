import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Local file-based storage for testing (no MongoDB required)
const DRAFTS_FILE = path.join(process.cwd(), 'data', 'test-drafts.json')

// Load drafts from file
const loadDrafts = () => {
  if (!fs.existsSync(DRAFTS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(DRAFTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading drafts:', error)
    return []
  }
}

// Save drafts to file
const saveDrafts = (drafts: any[]) => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  try {
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts, null, 2))
  } catch (error) {
    console.error('Error saving drafts:', error)
    throw error
  }
}

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

    // Get all unpublished articles (drafts)
    const allDrafts = loadDrafts()
    const drafts = allDrafts.filter((draft: any) => !draft.published)
    
    return NextResponse.json({
      success: true,
      drafts: drafts.map((draft: any) => ({
        id: draft.id,
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

    const drafts = loadDrafts()
    const draftIndex = drafts.findIndex((d: any) => d.id === draftId)
    
    if (draftIndex === -1) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }
    
    // Remove the draft
    drafts.splice(draftIndex, 1)
    saveDrafts(drafts)
    
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