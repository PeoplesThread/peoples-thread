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

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username, email, name, role, bio, isActive, permissions } = body

    // Try database first, fallback to file system
    try {
      await dbConnect()
      
      const updateData: any = {
        username,
        email,
        name,
        role,
        bio,
        isActive
      }

      // If permissions are provided, use them; otherwise let the role pre-save hook set them
      if (permissions) {
        updateData.permissions = permissions
      }

      const updatedUser = await User.findByIdAndUpdate(
        params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password')

      if (!updatedUser) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        message: 'User updated successfully',
        user: {
          ...updatedUser.toObject(),
          _id: updatedUser._id.toString()
        },
        source: 'database'
      })

    } catch (dbError) {
      console.log('Database unavailable, using file system for user update')
      
      const users = readUsersFromFile()
      const userIndex = users.findIndex((u: any) => u._id === params.id)
      
      if (userIndex === -1) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        username,
        email,
        name,
        role,
        bio,
        isActive,
        permissions: permissions || getDefaultPermissions(role),
        updatedAt: new Date().toISOString()
      }

      writeUsersToFile(users)

      const { password: _, ...userWithoutPassword } = users[userIndex]

      return NextResponse.json({
        message: 'User updated successfully',
        user: userWithoutPassword,
        source: 'filesystem'
      })
    }

  } catch (error: any) {
    console.error('Error updating user:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Prevent deleting the main admin user
    if (params.id === adminUser._id.toString()) {
      return NextResponse.json(
        { message: 'Cannot delete your own admin account' },
        { status: 400 }
      )
    }

    // Try database first, fallback to file system
    try {
      await dbConnect()
      
      const deletedUser = await User.findByIdAndDelete(params.id)
      
      if (!deletedUser) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        message: 'User deleted successfully',
        source: 'database'
      })

    } catch (dbError) {
      console.log('Database unavailable, using file system for user deletion')
      
      const users = readUsersFromFile()
      const userIndex = users.findIndex((u: any) => u._id === params.id)
      
      if (userIndex === -1) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      users.splice(userIndex, 1)
      writeUsersToFile(users)

      return NextResponse.json({
        message: 'User deleted successfully',
        source: 'filesystem'
      })
    }

  } catch (error) {
    console.error('Error deleting user:', error)
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