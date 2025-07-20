import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

// Import the schema from the main route file
const ScheduledPostSchema = new mongoose.Schema({
  topic: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['politics', 'social-justice', 'labor'] },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
  customPrompt: { type: String, trim: true },
  recurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  errorMessage: { type: String },
  lastExecuted: { type: Date }
}, { timestamps: true })

const ScheduledPost = mongoose.models.ScheduledPost || mongoose.model('ScheduledPost', ScheduledPostSchema)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    // First find the post
    const posts = await ScheduledPost.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(params.id) } }
    ])
    const post = posts[0]
    
    if (post) {
      await ScheduledPost.deleteOne({ _id: params.id })
    }

    if (!post) {
      return NextResponse.json(
        { message: 'Scheduled post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Scheduled post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting scheduled post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}