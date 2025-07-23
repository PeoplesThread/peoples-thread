import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

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

    await dbConnect()
    
    const draft = await Article.findById(params.id)
    
    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      draft: {
        id: draft._id,
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

    await dbConnect()
    
    const updateData: any = {
      title,
      content,
      excerpt,
      category: category || 'politics',
      tags: Array.isArray(tags) ? tags : [],
      published,
      author: author || 'Peoples Thread Editorial'
    }

    // If publishing, set publishedAt
    if (published) {
      updateData.publishedAt = new Date()
    }

    // Update slug if title changed
    if (title) {
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100)
      
      // Ensure unique slug (excluding current article)
      let slug = baseSlug
      let counter = 1
      while (await Article.findOne({ slug, _id: { $ne: params.id } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }
    
    const updatedDraft = await Article.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
    
    if (!updatedDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }
    
    console.log(`✅ ${published ? 'Published' : 'Updated'} article: "${title}"`)
    console.log(`🔗 Slug: ${updatedDraft.slug}`)
    
    return NextResponse.json({
      success: true,
      message: `Article ${published ? 'published' : 'updated'} successfully`,
      article: {
        id: updatedDraft._id,
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