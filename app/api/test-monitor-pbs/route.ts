import { NextRequest, NextResponse } from 'next/server'
import { fetchPBSArticles } from '@/lib/pbsMonitor'
import fs from 'fs'
import path from 'path'

// Local file-based storage for testing (no MongoDB required)
const DRAFTS_FILE = path.join(process.cwd(), 'data', 'test-drafts.json')

// Load drafts from file
const loadDrafts = () => {
  if (!fs.existsSync(DRAFTS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(DRAFTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading drafts:', error)
    return []
  }
}

// Save drafts to file
const saveDrafts = (drafts: any[]) => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  try {
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts, null, 2))
  } catch (error) {
    console.error('Error saving drafts:', error)
    throw error
  }
}

// Generate mock leftist response
const generateMockLeftistResponse = async (pbsArticle: any) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    title: `Working Class Analysis: ${pbsArticle.title.replace(/Prime Minister|coalition|Japan's/g, '').trim()} - What This Means for Workers`,
    excerpt: `While mainstream media focuses on surface politics, we examine how ${pbsArticle.title.toLowerCase()} affects working families and what it means for democratic participation.`,
    content: `<p>The recent developments reported by PBS NewsHour deserve analysis from a working-class perspective that mainstream media often overlooks.</p>

<p><strong>Beyond Electoral Politics</strong></p>
<p>While PBS NewsHour reports on political maneuvering, we must ask: what does this mean for ordinary working people? Electoral shifts often mask real issues affecting workers, families, and marginalized communities.</p>

<p><strong>The Broader Context</strong></p>
<p>This political development occurs against a backdrop of:</p>
<ul>
<li>Rising economic inequality</li>
<li>Stagnant wages despite corporate profits</li>
<li>Weakening labor protections</li>
<li>Growing housing and healthcare costs</li>
</ul>

<p><strong>What This Means for Workers</strong></p>
<p>Political instability often translates to policy uncertainty that disproportionately affects working families. When power structures shift, progressive reforms get delayed while corporate interests remain protected.</p>

<p><strong>International Solidarity</strong></p>
<p>The challenges facing workers globally mirror each other. From the United States to Asia, we see similar patterns of political systems that prioritize capital over labor.</p>

<p><strong>Moving Forward</strong></p>
<p>Real change comes from grassroots organizing, labor solidarity, and international cooperation among working-class movements. We must build power from below, not wait for it to trickle down from above.</p>

<p>As we watch these developments unfold, let's remember that our liberation is bound together across borders, and that true democracy means economic democracy - where working people have a real say in decisions affecting their daily lives.</p>`,
    category: 'politics',
    tags: ['international', 'democracy', 'working-class', 'political-analysis']
  }
}

// Create article from PBS (local version)
const createTestArticleFromPBS = async (pbsArticle: any) => {
  try {
    const drafts = loadDrafts()
    
    // Check if we've already created an article for this PBS article
    const existingArticle = drafts.find((d: any) => d.sourceUrl === pbsArticle.url)
    
    if (existingArticle) {
      console.log('ℹ️ Article already exists for PBS source:', pbsArticle.url)
      return false
    }
    
    // Generate mock leftist response
    const leftistArticle = await generateMockLeftistResponse(pbsArticle)
    
    // Create slug from title
    let baseSlug = leftistArticle.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100)
    
    // Ensure unique slug
    let slug = baseSlug
    let counter = 1
    while (drafts.find((d: any) => d.slug === slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Create new article
    const newArticle = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: leftistArticle.title,
      slug,
      content: leftistArticle.content,
      excerpt: leftistArticle.excerpt,
      author: 'Peoples Thread Editorial',
      category: leftistArticle.category,
      tags: leftistArticle.tags,
      published: false, // Save as draft for editing
      aiGenerated: true,
      sourceUrl: pbsArticle.url,
      sourceTitle: pbsArticle.title,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      views: 0
    }
    
    drafts.push(newArticle)
    saveDrafts(drafts)
    
    console.log(`✅ Created new draft article: "${leftistArticle.title}"`)
    console.log(`🔗 Slug: ${slug}`)
    console.log(`📝 Article saved as draft for editing before publication`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error creating test article from PBS:', error)
    throw error
  }
}

// Main monitoring function (test version)
const testMonitorPBSAndCreateArticles = async () => {
  const result = {
    success: true,
    articlesProcessed: 0,
    articlesCreated: 0,
    errors: [] as string[]
  }

  try {
    console.log('🔍 Starting TEST PBS NewsHour monitoring...')
    
    const pbsArticles = await fetchPBSArticles()
    console.log(`📰 Found ${pbsArticles.length} relevant PBS articles`)
    
    if (pbsArticles.length === 0) {
      console.log('ℹ️ No relevant articles found with current keywords')
      return result
    }
    
    for (const pbsArticle of pbsArticles) {
      result.articlesProcessed++
      
      try {
        console.log(`\n📝 Processing article ${result.articlesProcessed}/${pbsArticles.length}: "${pbsArticle.title}"`)
        
        const created = await createTestArticleFromPBS(pbsArticle)
        if (created) {
          result.articlesCreated++
          console.log(`✅ Successfully created mock leftist response article`)
        } else {
          console.log(`ℹ️ Article already exists, skipping`)
        }
        
        // Add delay to avoid overwhelming the system
        if (result.articlesProcessed < pbsArticles.length) {
          console.log('⏳ Waiting 2 seconds before next article...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (error) {
        const errorMsg = `Failed to process "${pbsArticle.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        result.errors.push(errorMsg)
        result.success = false
      }
    }
    
    console.log(`\n🎉 TEST PBS monitoring completed!`)
    console.log(`📊 Summary: ${result.articlesCreated}/${result.articlesProcessed} articles created`)
    if (result.errors.length > 0) {
      console.log(`⚠️ Errors: ${result.errors.length}`)
      result.errors.forEach(error => console.log(`   - ${error}`))
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Error in TEST PBS monitoring:', error)
    result.success = false
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return result
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key or admin authentication
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.PBS_MONITOR_API_KEY || 'your-secret-key'
    
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting TEST PBS monitoring process...')
    const result = await testMonitorPBSAndCreateArticles()
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `TEST PBS monitoring completed successfully. Created ${result.articlesCreated}/${result.articlesProcessed} draft articles.`
        : `TEST PBS monitoring completed with errors. Created ${result.articlesCreated}/${result.articlesProcessed} draft articles.`,
      details: {
        articlesProcessed: result.articlesProcessed,
        articlesCreated: result.articlesCreated,
        errors: result.errors,
        note: 'This is a test version using mock AI generation and local file storage.'
      }
    })
  } catch (error) {
    console.error('Error in TEST PBS monitoring API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to monitor PBS articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'TEST PBS Monitor API',
    usage: 'Send POST request with Bearer token to trigger test monitoring',
    status: 'Active',
    note: 'This version uses mock AI generation and local file storage for testing'
  })
}