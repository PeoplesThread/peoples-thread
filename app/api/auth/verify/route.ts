import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import fs from 'fs'
import path from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

// Helper function to read users from file
function readUsersFromFile() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading users file:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Get fresh user data to ensure permissions are up to date
    let user = null

    try {
      await dbConnect()
      user = await User.findById(decoded.userId).select('-password')
      
      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'User not found or inactive' },
          { status: 401 }
        )
      }
    } catch (dbError) {
      console.log('Database unavailable, using file system for user verification')
      
      const users = readUsersFromFile()
      const fileUser = users.find((u: any) => u._id === decoded.userId)
      
      if (!fileUser || !fileUser.isActive) {
        return NextResponse.json(
          { error: 'User not found or inactive' },
          { status: 401 }
        )
      }
      
      const { password, ...userWithoutPassword } = fileUser
      user = userWithoutPassword
    }

    return NextResponse.json(
      { 
        message: 'Token valid', 
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          token // Include token for frontend use
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}