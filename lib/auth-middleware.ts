import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return { error: 'No token provided', status: 401 }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { user: decoded, error: null }
  } catch (error) {
    console.error('Token verification error:', error)
    return { error: 'Invalid token', status: 401 }
  }
}

export function withAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = verifyAuth(request)
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      )
    }

    return handler(request, authResult.user)
  }
}