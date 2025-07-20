import { NextRequest, NextResponse } from 'next/server'
import { initializeScheduler } from '@/lib/scheduler'

export async function POST(request: NextRequest) {
  try {
    initializeScheduler()
    
    return NextResponse.json({
      message: 'Content scheduler initialized successfully'
    })
  } catch (error) {
    console.error('Error initializing scheduler:', error)
    return NextResponse.json(
      { message: 'Failed to initialize scheduler' },
      { status: 500 }
    )
  }
}