import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect()
    
    const articles = await Article.aggregate([
      { $match: { slug: params.slug, published: true } }
    ])
    const article = articles[0]

    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await (Article as any).updateOne({ _id: article._id }, { $inc: { views: 1 } })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { title, content, excerpt, category, tags, author, featuredImage, published, featured } = body

    const updateData: any = {
      title,
      content,
      excerpt,
      category,
      tags,
      author,
      featuredImage,
      published,
      featured
    }

    // Update slug if title changed
    if (title) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // Set publishedAt if publishing for the first time
    if (published) {
      const existingArticles = await Article.aggregate([
        { $match: { slug: params.slug } }
      ])
      const existingArticle = existingArticles[0]
      if (existingArticle && !existingArticle.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    await (Article as any).updateOne({ slug: params.slug }, updateData)
    const updatedArticles = await Article.aggregate([
      { $match: { slug: params.slug } }
    ])
    const article = updatedArticles[0]

    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Article updated successfully', 
      article 
    })
  } catch (error: any) {
    console.error('Error updating article:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Article with this title already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect()
    
    // First find the article
    const articles = await Article.aggregate([
      { $match: { slug: params.slug } }
    ])
    const article = articles[0]
    
    if (article) {
      await (Article as any).deleteOne({ slug: params.slug })
    }

    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Article deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}