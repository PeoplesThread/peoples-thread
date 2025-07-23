import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const KEYWORDS_FILE = path.join(process.cwd(), 'data', 'keywords.json')

// Default keywords if file doesn't exist
const DEFAULT_KEYWORDS = [
  'labor', 'union', 'workers', 'strike', 'wages', 'employment',
  'healthcare', 'housing', 'inequality', 'poverty', 'welfare',
  'corporate', 'capitalism', 'economy', 'recession', 'inflation',
  'climate', 'environment', 'fossil fuel', 'renewable energy',
  'immigration', 'refugee', 'border', 'deportation',
  'police', 'criminal justice', 'prison', 'reform',
  'education', 'student debt', 'public school',
  'voting rights', 'democracy', 'election', 'gerrymandering',
  'tax', 'wealth', 'billionaire', 'minimum wage',
  'social security', 'medicare', 'medicaid'
]

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function getKeywords(): Promise<string[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(KEYWORDS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // File doesn't exist, create it with default keywords
    await saveKeywords(DEFAULT_KEYWORDS)
    return DEFAULT_KEYWORDS
  }
}

async function saveKeywords(keywords: string[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(KEYWORDS_FILE, JSON.stringify(keywords, null, 2))
}

function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.PBS_MONITOR_API_KEY || 'your-secret-key'
  return authHeader === `Bearer ${apiKey}`
}

// GET - Retrieve current keywords
export async function GET(request: NextRequest) {
  try {
    if (!validateAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keywords = await getKeywords()
    
    return NextResponse.json({
      success: true,
      keywords,
      count: keywords.length
    })
  } catch (error) {
    console.error('Error getting keywords:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Add new keywords
export async function POST(request: NextRequest) {
  try {
    if (!validateAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keywords: newKeywords } = await request.json()
    
    if (!Array.isArray(newKeywords)) {
      return NextResponse.json(
        { error: 'Keywords must be an array' },
        { status: 400 }
      )
    }

    const currentKeywords = await getKeywords()
    const cleanedKeywords = newKeywords
      .map(k => k.toLowerCase().trim())
      .filter(k => k.length > 0)
    
    // Add only new keywords (avoid duplicates)
    const uniqueNewKeywords = cleanedKeywords.filter(k => !currentKeywords.includes(k))
    const updatedKeywords = [...currentKeywords, ...uniqueNewKeywords].sort()
    
    await saveKeywords(updatedKeywords)
    
    return NextResponse.json({
      success: true,
      message: `Added ${uniqueNewKeywords.length} new keywords`,
      keywords: updatedKeywords,
      added: uniqueNewKeywords,
      duplicates: cleanedKeywords.length - uniqueNewKeywords.length
    })
  } catch (error) {
    console.error('Error adding keywords:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove keywords
export async function DELETE(request: NextRequest) {
  try {
    if (!validateAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keywords: keywordsToRemove } = await request.json()
    
    if (!Array.isArray(keywordsToRemove)) {
      return NextResponse.json(
        { error: 'Keywords must be an array' },
        { status: 400 }
      )
    }

    const currentKeywords = await getKeywords()
    const cleanedKeywords = keywordsToRemove.map(k => k.toLowerCase().trim())
    
    const updatedKeywords = currentKeywords.filter(k => !cleanedKeywords.includes(k))
    const removedCount = currentKeywords.length - updatedKeywords.length
    
    await saveKeywords(updatedKeywords)
    
    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} keywords`,
      keywords: updatedKeywords,
      removed: removedCount
    })
  } catch (error) {
    console.error('Error removing keywords:', error)
    return NextResponse.json(
      { 
        error: 'Failed to remove keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Replace all keywords
export async function PUT(request: NextRequest) {
  try {
    if (!validateAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keywords: newKeywords } = await request.json()
    
    if (!Array.isArray(newKeywords)) {
      return NextResponse.json(
        { error: 'Keywords must be an array' },
        { status: 400 }
      )
    }

    const cleanedKeywords = newKeywords
      .map(k => k.toLowerCase().trim())
      .filter(k => k.length > 0)
      .filter((k, index, arr) => arr.indexOf(k) === index) // Remove duplicates
      .sort()
    
    await saveKeywords(cleanedKeywords)
    
    return NextResponse.json({
      success: true,
      message: `Updated keywords list (${cleanedKeywords.length} keywords)`,
      keywords: cleanedKeywords
    })
  } catch (error) {
    console.error('Error updating keywords:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}