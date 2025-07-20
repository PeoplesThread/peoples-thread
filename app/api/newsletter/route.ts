import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

// Newsletter subscriber schema
const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema)

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingSubscribers = await Newsletter.aggregate([
      { $match: { email } }
    ])
    const existingSubscriber = existingSubscribers[0]
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { message: 'Email is already subscribed' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date()
        await existingSubscriber.save()
        
        return NextResponse.json({
          message: 'Successfully resubscribed to newsletter'
        })
      }
    }

    // Create new subscriber
    const subscriber = new Newsletter({ email })
    await subscriber.save()

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter'
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Email is already subscribed' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const subscribers = await Newsletter.aggregate([
      { $match: { isActive: true } },
      { $sort: { subscribedAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])

    const total = await Newsletter.countDocuments({ isActive: true })

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    await (Newsletter as any).updateOne({ email }, { isActive: false })
    const updatedSubscribers = await Newsletter.aggregate([
      { $match: { email } }
    ])
    const subscriber = updatedSubscribers[0]

    if (!subscriber) {
      return NextResponse.json(
        { message: 'Email not found in subscription list' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter'
    })
  } catch (error) {
    console.error('Newsletter unsubscription error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}