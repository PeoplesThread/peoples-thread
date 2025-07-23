import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting article migration...')
    
    await dbConnect()
    
    // Get all articles
    const articles = await Article.find({})
    console.log(`Found ${articles.length} articles to migrate`)
    
    let migratedCount = 0
    
    // Update each article with new fields if they don't exist
    for (const article of articles) {
      const updateData: any = {}
      
      if (!article.difficulty) updateData.difficulty = 'beginner'
      if (!article.priority) updateData.priority = 'normal'
      if (article.enableComments === undefined) updateData.enableComments = true
      if (article.enableNewsletter === undefined) updateData.enableNewsletter = true
      if (!article.metaDescription && article.excerpt) {
        updateData.metaDescription = article.excerpt.substring(0, 160)
      }
      
      // Only update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await Article.findByIdAndUpdate(article._id, updateData)
        migratedCount++
      }
    }
    
    console.log(`Migration completed! Updated ${migratedCount} articles`)
    
    return NextResponse.json({
      success: true,
      message: `Migration completed successfully! Updated ${migratedCount} out of ${articles.length} articles`,
      migratedCount,
      totalArticles: articles.length
    })
    
  } catch (error: any) {
    console.error('Migration failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}