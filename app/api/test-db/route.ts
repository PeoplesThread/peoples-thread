import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    await dbConnect()
    console.log('Database connected successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Database connection failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}