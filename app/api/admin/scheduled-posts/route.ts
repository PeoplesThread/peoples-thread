import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'
import { withAuth } from '@/lib/auth-middleware'

// Scheduled Post schema
const ScheduledPostSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['politics', 'social-justice', 'labor']
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  customPrompt: {
    type: String,
    trim: true
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  errorMessage: {
    type: String
  },
  lastExecuted: {
    type: Date
  }
}, {
  timestamps: true
})

const ScheduledPost = mongoose.models.ScheduledPost || mongoose.model('ScheduledPost', ScheduledPostSchema)

// Temporarily remove auth for debugging  
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const posts = await ScheduledPost.aggregate([
      { $sort: { scheduledFor: 1 } }
    ])

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching scheduled posts:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { topic, category, scheduledFor, customPrompt, recurring, recurringInterval } = body

    if (!topic || !category || !scheduledFor) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { message: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    const scheduledPost = new ScheduledPost({
      topic,
      category,
      scheduledFor: scheduledDate,
      customPrompt,
      recurring,
      recurringInterval: recurring ? recurringInterval : undefined
    })

    await scheduledPost.save()

    return NextResponse.json({
      message: 'Scheduled post created successfully',
      post: scheduledPost
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating scheduled post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}