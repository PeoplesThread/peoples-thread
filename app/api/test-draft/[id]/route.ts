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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const drafts = loadDrafts()
    const draft = drafts.find((d: any) => d.id === params.id)
    
    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        title: draft.title,
        slug: draft.slug,
        content: draft.content,
        excerpt: draft.excerpt,
        author: draft.author,
        category: draft.category,
        tags: draft.tags,
        published: draft.published,
        sourceUrl: draft.sourceUrl,
        sourceTitle: draft.sourceTitle,
        aiGenerated: draft.aiGenerated,
        createdAt: draft.createdAt,
        publishedAt: draft.publishedAt
      }
    })
  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { 
      title, 
      content, 
      excerpt, 
      category, 
      tags, 
      published = false,
      author
    } = body

    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, excerpt' },
        { status: 400 }
      )
    }

    const drafts = loadDrafts()
    const draftIndex = drafts.findIndex((d: any) => d.id === params.id)
    
    if (draftIndex === -1) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    const existingDraft = drafts[draftIndex]
    
    // Update slug if title changed
    let slug = existingDraft.slug
    if (title !== existingDraft.title) {
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100)
      
      // Ensure unique slug (excluding current draft)
      slug = baseSlug
      let counter = 1
      while (drafts.find((d: any, index: number) => d.slug === slug && index !== draftIndex)) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Update the draft
    const updatedDraft = {
      ...existingDraft,
      title,
      slug,
      content,
      excerpt,
      category: category || 'politics',
      tags: Array.isArray(tags) ? tags : [],
      published,
      author: author || 'Peoples Thread Editorial',
      publishedAt: published ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    }

    drafts[draftIndex] = updatedDraft
    saveDrafts(drafts)
    
    console.log(`✅ ${published ? 'Published' : 'Updated'} article: "${title}"`)
    console.log(`🔗 Slug: ${slug}`)
    
    return NextResponse.json({
      success: true,
      message: `Article ${published ? 'published' : 'updated'} successfully`,
      article: {
        id: updatedDraft.id,
        title: updatedDraft.title,
        slug: updatedDraft.slug,
        published: updatedDraft.published,
        category: updatedDraft.category,
        tags: updatedDraft.tags
      }
    })
    
  } catch (error) {
    console.error('Error updating draft:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}