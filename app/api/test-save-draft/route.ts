import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Local file-based storage for testing (no MongoDB required)
const DRAFTS_FILE = path.join(process.cwd(), 'data', 'test-drafts.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load drafts from file
const loadDrafts = () => {
  ensureDataDir()
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
  ensureDataDir()
  try {
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts, null, 2))
  } catch (error) {
    console.error('Error saving drafts:', error)
    throw error
  }
}

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
    const { 
      title, 
      content, 
      excerpt, 
      category, 
      tags, 
      sourceUrl, 
      sourceTitle,
      published = false,
      author = 'Peoples Thread Editorial'
    } = body

    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, excerpt' },
        { status: 400 }
      )
    }

    // Load existing drafts
    const drafts = loadDrafts()
    
    // Create slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100)
    
    // Ensure unique slug
    let slug = baseSlug
    let counter = 1
    while (drafts.find((d: any) => d.slug === slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Check if article with same source URL already exists
    if (sourceUrl) {
      const existingArticle = drafts.find((d: any) => d.sourceUrl === sourceUrl)
      if (existingArticle) {
        return NextResponse.json(
          { 
            error: 'Article with this source URL already exists',
            existingSlug: existingArticle.slug
          },
          { status: 409 }
        )
      }
    }
    
    // Create new article
    const newArticle = {
      id: Date.now().toString(), // Simple ID for testing
      title,
      slug,
      content,
      excerpt,
      author,
      category: category || 'politics',
      tags: Array.isArray(tags) ? tags : [],
      published,
      aiGenerated: true,
      sourceUrl,
      sourceTitle,
      publishedAt: published ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      views: 0
    }
    
    // Add to drafts array
    drafts.push(newArticle)
    
    // Save to file
    saveDrafts(drafts)
    
    console.log(`✅ ${published ? 'Published' : 'Saved draft'} article: "${title}"`)
    console.log(`🔗 Slug: ${slug}`)
    console.log(`💾 Saved to local file: ${DRAFTS_FILE}`)
    
    return NextResponse.json({
      success: true,
      message: `Article ${published ? 'published' : 'saved as draft'} successfully`,
      article: {
        id: newArticle.id,
        title: newArticle.title,
        slug: newArticle.slug,
        published: newArticle.published,
        category: newArticle.category,
        tags: newArticle.tags
      }
    })
    
  } catch (error) {
    console.error('Error saving article:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test Save Draft API (Local File Storage)',
    usage: 'Send POST request with article data to save as draft or publish',
    status: 'Active',
    storage: 'Local file system (no MongoDB required)'
  })
}