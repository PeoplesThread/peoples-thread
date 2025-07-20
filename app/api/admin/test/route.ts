import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    console.log('Test API called')
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI)
    console.log('MongoDB URI preview:', process.env.MONGODB_URI?.substring(0, 20) + '...')
    
    await dbConnect()
    console.log('Database connected successfully')
    console.log('Connection state:', mongoose.connection.readyState)
    console.log('Database name:', mongoose.connection.name)
    
    // Test basic database operations
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Available collections:', collections.map(c => c.name))
    
    const articles = await (Article as any).find({}).limit(5).lean()
    console.log('Found articles:', articles.length)
    
    // Test Article model specifically
    const articleCount = await Article.countDocuments({})
    console.log('Total article count:', articleCount)
    
    return NextResponse.json({
      success: true,
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name,
        collections: collections.map(c => c.name)
      },
      articles: {
        count: articleCount,
        sample: articles.map(a => ({ 
          title: a.title, 
          slug: a.slug, 
          category: a.category,
          published: a.published 
        }))
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed', 
        details: error.message,
        stack: error.stack,
        mongoState: mongoose.connection.readyState
      },
      { status: 500 }
    )
  }
}