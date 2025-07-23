import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article, { IArticle } from '@/models/Article'
import mongoose from 'mongoose'
import { withAuth } from '@/lib/auth-middleware'

// Newsletter schema for subscriber count
const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now }
})

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema)

// Temporarily remove auth for debugging
export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API called')
    
    // Connect to database with timeout handling
    await Promise.race([
      dbConnect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 8000)
      )
    ])
    
    console.log('Database connected for analytics')
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    console.log(`Fetching analytics for last ${days} days`)

    // Execute all database operations with timeout handling
    const analyticsData = await Promise.race([
      Promise.all([
        // Basic article stats
        Article.countDocuments({}),
        Article.countDocuments({ published: true }),
        Article.countDocuments({ published: false }),

        
        // Total views
        Article.aggregate([
          { $match: { published: true } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]),
        
        // Newsletter subscribers
        Newsletter.countDocuments({ isActive: true }),
        
        // Category stats
        Article.aggregate([
          { $match: { published: true } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Top articles by views
        Article.aggregate([
          { $match: { published: true } },
          { $sort: { views: -1 } },
          { $limit: 10 },
          { $project: { title: 1, slug: 1, views: 1, category: 1 } }
        ]),
        
        // Recent activity
        Article.aggregate([
          {
            $match: {
              published: true,
              publishedAt: { $gte: dateFrom }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$publishedAt'
                }
              },
              articles: { $sum: 1 },
              views: { $sum: '$views' }
            }
          },
          {
            $sort: { _id: 1 }
          },
          {
            $project: {
              date: '$_id',
              articles: 1,
              views: 1,
              _id: 0
            }
          }
        ])
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 12000)
      )
    ]) as [number, number, number, any[], number, any[], any[], any[]]

    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      viewsResult,
      newsletterSubscribers,
      categoryStats,
      topArticles,
      recentActivity
    ] = analyticsData

    console.log('Analytics queries completed successfully')

    const totalViews = viewsResult[0]?.totalViews || 0

    const categoryStatsObj = {
      politics: 0,
      'social-justice': 0,
      labor: 0
    }

    categoryStats.forEach(stat => {
      if (stat._id in categoryStatsObj) {
        categoryStatsObj[stat._id as keyof typeof categoryStatsObj] = stat.count
      }
    })

    // Fill in missing dates with zero values
    const filledActivity = []
    const currentDate = new Date(dateFrom)
    const endDate = new Date()

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const existingData = recentActivity.find(item => item.date === dateStr)
      
      filledActivity.push({
        date: dateStr,
        articles: existingData?.articles || 0,
        views: existingData?.views || 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      newsletterSubscribers,
      categoryStats: categoryStatsObj,
      topArticles,
      recentActivity: filledActivity.slice(-30) // Last 30 days
    })

  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error.message.includes('timeout')) {
      errorMessage = 'Database connection timeout'
    } else if (error.name === 'MongoNetworkError') {
      errorMessage = 'Database network error'
    } else if (error.name === 'MongoServerSelectionError') {
      errorMessage = 'Database server unavailable'
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}