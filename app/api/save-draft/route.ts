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

    await dbConnect()
    
    // Create slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100)
    
    // Ensure unique slug
    let slug = baseSlug
    let counter = 1
    while (await Article.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Check if article with same source URL already exists
    if (sourceUrl) {
      const existingArticle = await Article.findOne({ sourceUrl })
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
    const newArticle = new Article({
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
      publishedAt: published ? new Date() : null,
      views: 0
    })
    
    await newArticle.save()
    
    console.log(`✅ ${published ? 'Published' : 'Saved draft'} article: "${title}"`)
    console.log(`🔗 Slug: ${slug}`)
    
    return NextResponse.json({
      success: true,
      message: `Article ${published ? 'published' : 'saved as draft'} successfully`,
      article: {
        id: newArticle._id,
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
    message: 'Save Draft API',
    usage: 'Send POST request with article data to save as draft or publish',
    status: 'Active'
  })
}