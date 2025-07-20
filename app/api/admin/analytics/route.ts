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
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Basic article stats
    const totalArticles = await Article.countDocuments({})
    const publishedArticles = await Article.countDocuments({ published: true })
    const draftArticles = await Article.countDocuments({ published: false })
    const aiGeneratedArticles = await Article.countDocuments({ aiGenerated: true })

    // Total views
    const viewsResult = await Article.aggregate([
      { $match: { published: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ])
    const totalViews = viewsResult[0]?.totalViews || 0

    // Newsletter subscribers
    const newsletterSubscribers = await Newsletter.countDocuments({ isActive: true })

    // Category stats
    const categoryStats = await Article.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

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

    // Top articles by views
    const topArticles = await Article.aggregate([
      { $match: { published: true } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $project: { title: 1, slug: 1, views: 1, category: 1 } }
    ])

    // Recent activity (articles published per day)
    const recentActivity = await Article.aggregate([
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
      aiGeneratedArticles,
      newsletterSubscribers,
      categoryStats: categoryStatsObj,
      topArticles,
      recentActivity: filledActivity.slice(-30) // Last 30 days
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}