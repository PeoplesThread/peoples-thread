import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import dbConnect from '@/lib/mongodb'
import Article from '@/models/Article'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const LEFTIST_PROMPTS = {
  politics: `Write a progressive political news article from a leftist perspective that:
- Critiques corporate influence in politics
- Advocates for working-class interests
- Supports progressive policies like Medicare for All, Green New Deal
- Challenges establishment narratives
- Focuses on systemic issues rather than individual politicians
- Uses evidence-based analysis
- Maintains journalistic integrity while advocating for social justice`,

  'social-justice': `Write a social justice news article from a leftist perspective that:
- Centers marginalized voices and experiences
- Analyzes systemic oppression and inequality
- Advocates for civil rights and human dignity
- Challenges racist, sexist, and discriminatory systems
- Promotes intersectional analysis
- Supports community organizing and grassroots movements
- Uses inclusive language and perspectives`,

  labor: `Write a labor rights news article from a leftist perspective that:
- Supports workers' rights and union organizing
- Critiques corporate exploitation and wage theft
- Advocates for living wages and workplace safety
- Analyzes class struggle and economic inequality
- Promotes collective bargaining and worker solidarity
- Challenges anti-union propaganda
- Focuses on worker empowerment and dignity`
}

export async function POST(request: NextRequest) {
  try {
    const { topic, category, customPrompt } = await request.json()

    if (!topic || !category) {
      return NextResponse.json(
        { message: 'Topic and category are required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const basePrompt = LEFTIST_PROMPTS[category as keyof typeof LEFTIST_PROMPTS] || LEFTIST_PROMPTS.politics
    const fullPrompt = customPrompt || `${basePrompt}

Topic: ${topic}

Please write a comprehensive news article (800-1200 words) with:
1. A compelling headline
2. An engaging lead paragraph
3. Well-researched content with specific examples
4. Quotes from relevant sources (activists, experts, affected communities)
5. Analysis of the broader implications
6. A call to action or next steps for readers

Format the response as JSON with the following structure:
{
  "title": "Article headline",
  "content": "Full article content in HTML format",
  "excerpt": "Brief summary (150-200 characters)",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a progressive journalist writing for a leftist news publication. Your articles should be well-researched, factual, and advocate for social justice, workers' rights, and progressive values."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { message: 'Failed to generate article content' },
        { status: 500 }
      )
    }

    try {
      const articleData = JSON.parse(response)
      
      // Validate the response structure
      if (!articleData.title || !articleData.content || !articleData.excerpt) {
        throw new Error('Invalid article structure')
      }

      return NextResponse.json({
        success: true,
        article: {
          title: articleData.title,
          content: articleData.content,
          excerpt: articleData.excerpt,
          category,
          tags: articleData.tags || [],
          author: 'AI Assistant',
          aiGenerated: true
        }
      })
    } catch (parseError) {
      // If JSON parsing fails, try to extract content manually
      const lines = response.split('\n').filter(line => line.trim())
      const title = lines.find(line => line.includes('title') || line.includes('headline'))?.replace(/[^a-zA-Z0-9\s]/g, '') || `Progressive Analysis: ${topic}`
      
      return NextResponse.json({
        success: true,
        article: {
          title: title.substring(0, 200),
          content: `<div class="article-content">${response.replace(/\n/g, '<br>')}</div>`,
          excerpt: `Progressive analysis of ${topic} from a leftist perspective.`,
          category,
          tags: [category, 'progressive', 'analysis'],
          author: 'AI Assistant',
          aiGenerated: true
        }
      })
    }
  } catch (error: any) {
    console.error('Error generating article:', error)
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { message: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to generate article' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { articleData, publish } = await request.json()

    if (!articleData) {
      return NextResponse.json(
        { message: 'Article data is required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const article = new Article({
      ...articleData,
      slug,
      published: publish || false,
      publishedAt: publish ? new Date() : undefined
    })

    await article.save()

    return NextResponse.json({
      success: true,
      message: publish ? 'Article published successfully' : 'Article saved as draft',
      article
    })
  } catch (error: any) {
    console.error('Error saving AI-generated article:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Article with this title already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to save article' },
      { status: 500 }
    )
  }
}