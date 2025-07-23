import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

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

// Helper function to write users to file
function writeUsersToFile(users: any[]) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(usersFilePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
    return true
  } catch (error) {
    console.error('Error writing users file:', error)
    return false
  }
}

// Verify admin token
async function verifyAdminToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Try database first, fallback to file system
    try {
      await dbConnect()
      const user = await User.findById(decoded.userId)
      return user && (user.role === 'admin' || user.permissions.canManageUsers) ? user : null
    } catch (dbError) {
      // Fallback to file system
      const users = readUsersFromFile()
      const user = users.find((u: any) => u._id === decoded.userId)
      return user && (user.role === 'admin' || user.permissions?.canManageUsers) ? user : null
    }
  } catch (error) {
    return null
  }
}

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Try database first, fallback to file system
    try {
      await dbConnect()
      const users = await User.find({}, '-password').sort({ createdAt: -1 })
      
      return NextResponse.json({
        users: users.map(user => ({
          ...user.toObject(),
          _id: user._id.toString()
        })),
        source: 'database'
      })
    } catch (dbError) {
      console.log('Database unavailable, using file system for users')
      
      const users = readUsersFromFile()
      const safeUsers = users.map((user: any) => {
        const { password, ...safeUser } = user
        return safeUser
      })
      
      return NextResponse.json({
        users: safeUsers,
        source: 'filesystem'
      })
    }

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username, email, password, name, role, bio } = body

    if (!username || !email || !password || !name) {
      return NextResponse.json(
        { message: 'Username, email, password, and name are required' },
        { status: 400 }
      )
    }

    // Try database first, fallback to file system
    try {
      await dbConnect()
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      })
      
      if (existingUser) {
        return NextResponse.json(
          { message: 'User with this email or username already exists' },
          { status: 409 }
        )
      }

      const newUser = new User({
        username,
        email,
        password,
        name,
        role: role || 'writer',
        bio,
        createdBy: adminUser._id
      })

      await newUser.save()

      const { password: _, ...userWithoutPassword } = newUser.toObject()

      return NextResponse.json({
        message: 'User created successfully',
        user: {
          ...userWithoutPassword,
          _id: userWithoutPassword._id.toString()
        },
        source: 'database'
      })

    } catch (dbError) {
      console.log('Database unavailable, using file system for user creation')
      
      const users = readUsersFromFile()
      
      // Check if user already exists
      const existingUser = users.find((u: any) => 
        u.email === email || u.username === username
      )
      
      if (existingUser) {
        return NextResponse.json(
          { message: 'User with this email or username already exists' },
          { status: 409 }
        )
      }

      // Hash password (simple implementation for file system)
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 12)

      const newUser = {
        _id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        name,
        role: role || 'writer',
        bio,
        isActive: true,
        createdBy: adminUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: getDefaultPermissions(role || 'writer')
      }

      users.push(newUser)
      writeUsersToFile(users)

      const { password: _, ...userWithoutPassword } = newUser

      return NextResponse.json({
        message: 'User created successfully',
        user: userWithoutPassword,
        source: 'filesystem'
      })
    }

  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case 'admin':
      return {
        canCreateArticles: true,
        canEditOwnArticles: true,
        canEditAllArticles: true,
        canDeleteArticles: true,
        canManageUsers: true,
        canPublishArticles: true,
        canManageSettings: true
      }
    case 'editor':
      return {
        canCreateArticles: true,
        canEditOwnArticles: true,
        canEditAllArticles: true,
        canDeleteArticles: true,
        canManageUsers: false,
        canPublishArticles: true,
        canManageSettings: false
      }
    case 'writer':
    default:
      return {
        canCreateArticles: true,
        canEditOwnArticles: true,
        canEditAllArticles: false,
        canDeleteArticles: false,
        canManageUsers: false,
        canPublishArticles: false,
        canManageSettings: false
      }
  }
}