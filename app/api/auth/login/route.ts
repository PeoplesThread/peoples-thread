import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
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

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    let user = null

    // Try database first, fallback to file system
    try {
      await dbConnect()
      user = await User.findOne({ 
        $or: [{ username }, { email: username }],
        isActive: true 
      })

      if (user) {
        const isValidPassword = await user.comparePassword(password)
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          )
        }

        // Update last login
        user.lastLogin = new Date()
        await user.save()
      }
    } catch (dbError) {
      console.log('Database unavailable, using file system for authentication')
      
      const users = readUsersFromFile()
      const fileUser = users.find((u: any) => 
        (u.username === username || u.email === username) && u.isActive
      )

      if (fileUser) {
        const isValidPassword = await bcrypt.compare(password, fileUser.password)
        if (isValidPassword) {
          user = fileUser
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Create response with token and user info
    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      },
      { status: 200 }
    )

    // Set HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}