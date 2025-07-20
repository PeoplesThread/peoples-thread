import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

export async function POST(request: NextRequest) {
  try {
    console.log('Seeding database with test articles...')
    await dbConnect()
    
    // Check if articles already exist
    const existingCount = await Article.countDocuments({})
    console.log('Existing articles:', existingCount)
    
    if (existingCount > 0) {
      return NextResponse.json({
        message: 'Database already has articles',
        count: existingCount
      })
    }
    
    // Create test articles
    const testArticles = [
      {
        title: 'Workers Unite for Better Conditions',
        slug: 'workers-unite-better-conditions',
        content: '<p>This is a test article about workers rights and organizing for better workplace conditions.</p>',
        excerpt: 'This is a test article about workers rights and organizing for better workplace conditions.',
        category: 'labor',
        tags: ['workers', 'organizing', 'labor rights'],
        author: 'Test Author',
        published: true,
        featured: false,
        aiGenerated: false,
        publishedAt: new Date(),
        views: 0,
        likes: 0
      },
      {
        title: 'Fighting for Social Justice',
        slug: 'fighting-social-justice',
        content: '<p>This is a test article about social justice movements and civil rights.</p>',
        excerpt: 'This is a test article about social justice movements and civil rights.',
        category: 'social-justice',
        tags: ['social justice', 'civil rights', 'equality'],
        author: 'Test Author',
        published: true,
        featured: true,
        aiGenerated: false,
        publishedAt: new Date(),
        views: 0,
        likes: 0
      },
      {
        title: 'Political Analysis Draft',
        slug: 'political-analysis-draft',
        content: '<p>This is a draft article about political analysis.</p>',
        excerpt: 'This is a draft article about political analysis.',
        category: 'politics',
        tags: ['politics', 'analysis'],
        author: 'Test Author',
        published: false,
        featured: false,
        aiGenerated: true,
        views: 0,
        likes: 0
      }
    ]
    
    const createdArticles = await (Article as any).insertMany(testArticles)
    console.log('Created articles:', createdArticles.length)
    
    return NextResponse.json({
      message: 'Test articles created successfully',
      count: createdArticles.length,
      articles: createdArticles.map(a => ({ title: a.title, slug: a.slug }))
    })
    
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed database', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}