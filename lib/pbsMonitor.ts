import OpenAI from 'openai'
import dbConnect from './mongodb'
import Article from '@/models/Article'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Function to get current monitored keywords
async function getMonitoredKeywords(): Promise<string[]> {
  try {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    
    const keywordsFile = path.join(process.cwd(), 'data', 'keywords.json')
    const data = await fs.readFile(keywordsFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    // Fallback to default keywords if file doesn't exist
    return [
      'labor', 'union', 'workers', 'strike', 'wages', 'employment',
      'healthcare', 'housing', 'inequality', 'poverty', 'welfare',
      'corporate', 'capitalism', 'economy', 'recession', 'inflation',
      'climate', 'environment', 'fossil fuel', 'renewable energy',
      'immigration', 'refugee', 'border', 'deportation',
      'police', 'criminal justice', 'prison', 'reform',
      'education', 'student debt', 'public school',
      'voting rights', 'democracy', 'election', 'gerrymandering',
      'tax', 'wealth', 'billionaire', 'minimum wage',
      'social security', 'medicare', 'medicaid'
    ]
  }
}

interface PBSArticle {
  title: string
  url: string
  content: string
  publishedDate: string
  summary: string
}

export async function fetchPBSArticles(): Promise<PBSArticle[]> {
  try {
    console.log('Fetching PBS NewsHour RSS feed...')
    
    // Get current monitored keywords
    const MONITORED_KEYWORDS = await getMonitoredKeywords()
    console.log(`Using ${MONITORED_KEYWORDS.length} monitored keywords`)
    
    // Using RSS feed from PBS NewsHour
    const response = await fetch('https://www.pbs.org/newshour/feeds/rss/headlines', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PeoplesThread/1.0; +https://peoplesthread.com)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
    }
    
    const rssText = await response.text()
    console.log('RSS feed fetched successfully')
    
    // Parse RSS feed with better regex patterns
    const articles: PBSArticle[] = []
    const itemMatches = rssText.match(/<item[^>]*>(.*?)<\/item>/gs)
    
    if (itemMatches) {
      console.log(`Found ${itemMatches.length} total articles in RSS feed`)
      
      for (const item of itemMatches.slice(0, 15)) { // Get latest 15 articles
        try {
          // More flexible title matching
          const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s) ||
                            item.match(/<title[^>]*>(.*?)<\/title>/s)
          
          const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/s) ||
                           item.match(/<guid[^>]*>(.*?)<\/guid>/s)
          
          const descMatch = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s)
          
          const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/s)
          
          if (titleMatch && linkMatch) {
            const title = titleMatch[1].trim()
            const url = linkMatch[1].trim()
            const summary = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : ''
            const publishedDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString()
            
            // Check if article contains monitored keywords
            const searchText = `${title} ${summary}`.toLowerCase()
            const containsKeywords = MONITORED_KEYWORDS.some(keyword => 
              searchText.includes(keyword.toLowerCase())
            )
            
            if (containsKeywords) {
              console.log(`✓ Found relevant article: "${title}"`)
              
              // Fetch full article content with timeout
              const content = await fetchArticleContent(url)
              
              articles.push({
                title,
                url,
                content,
                publishedDate,
                summary: summary || title
              })
            }
          }
        } catch (itemError) {
          console.error('Error parsing RSS item:', itemError)
          continue
        }
      }
    }
    
    console.log(`Found ${articles.length} relevant articles with monitored keywords`)
    return articles
  } catch (error) {
    console.error('Error fetching PBS articles:', error)
    return []
  }
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    console.log(`Fetching content from: ${url}`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PeoplesThread/1.0; +https://peoplesthread.com)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.warn(`Failed to fetch article content: ${response.status}`)
      return ''
    }
    
    const html = await response.text()
    
    // Try multiple selectors to extract main content
    const contentSelectors = [
      /<div[^>]*class="[^"]*body-text[^"]*"[^>]*>(.*?)<\/div>/s,
      /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>(.*?)<\/div>/s,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/s,
      /<article[^>]*>(.*?)<\/article>/s,
      /<main[^>]*>(.*?)<\/main>/s,
      /<div[^>]*id="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/s
    ]
    
    for (const selector of contentSelectors) {
      const match = html.match(selector)
      if (match) {
        const content = match[1]
          .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove scripts
          .replace(/<style[^>]*>.*?<\/style>/gs, '') // Remove styles
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        if (content.length > 200) { // Only return if we got substantial content
          console.log(`✓ Extracted ${content.length} characters of content`)
          return content.substring(0, 3000) // Limit content length
        }
      }
    }
    
    console.warn('Could not extract meaningful content from article')
    return ''
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Article fetch timed out')
    } else {
      console.error('Error fetching article content:', error)
    }
    return ''
  }
}

export async function generateLeftistResponse(pbsArticle: PBSArticle): Promise<{
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
}> {
  try {
    console.log(`Generating leftist response for: "${pbsArticle.title}"`)
    
    const contentPreview = pbsArticle.content.length > 0 
      ? pbsArticle.content.substring(0, 2000)
      : pbsArticle.summary

    const prompt = `You are a progressive journalist writing for "Peoples Thread," a leftist news publication that amplifies working-class voices. 

A PBS NewsHour article was published with the following details:
Title: ${pbsArticle.title}
Summary: ${pbsArticle.summary}
Content Preview: ${contentPreview}${pbsArticle.content.length > 2000 ? '...' : ''}

Write a response article from a leftist, working-class perspective that:
1. Provides critical analysis of the mainstream narrative
2. Centers working-class and marginalized voices
3. Connects the issue to broader systemic problems under capitalism
4. Offers progressive solutions and calls to action
5. Maintains journalistic integrity while advocating for social justice

The article should be 800-1200 words, well-researched, and engaging. Include:
- A compelling headline that frames the issue from a leftist perspective
- An engaging excerpt/summary (2-3 sentences)
- The main article content in HTML format with proper paragraphs
- Appropriate category (politics, social-justice, or labor)
- 3-5 relevant tags

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "title": "Article title here",
  "excerpt": "Brief 2-3 sentence summary here",
  "content": "<p>Full HTML content with proper paragraph tags here</p>",
  "category": "politics",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a progressive journalist writing for a leftist news publication. Always respond with valid JSON only. Provide thoughtful, well-researched analysis from a working-class perspective."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    console.log('✓ Received AI response, parsing JSON...')

    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    // Parse the JSON response
    let articleData
    try {
      articleData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Raw response:', response)
      throw new Error('Invalid JSON response from AI')
    }
    
    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.excerpt || !articleData.category) {
      throw new Error('Missing required fields in AI response')
    }

    // Ensure category is valid
    const validCategories = ['politics', 'social-justice', 'labor']
    if (!validCategories.includes(articleData.category)) {
      articleData.category = 'politics' // Default fallback
    }

    // Ensure tags is an array
    if (!Array.isArray(articleData.tags)) {
      articleData.tags = []
    }

    console.log(`✓ Generated article: "${articleData.title}" (${articleData.category})`)
    
    return {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      category: articleData.category,
      tags: articleData.tags
    }
  } catch (error) {
    console.error('Error generating leftist response:', error)
    throw error
  }
}

export async function createArticleFromPBS(pbsArticle: PBSArticle): Promise<boolean> {
  try {
    await dbConnect()
    
    // Check if we've already created an article for this PBS article
    const existingArticle = await Article.findOne({
      sourceUrl: pbsArticle.url
    })
    
    if (existingArticle) {
      console.log('ℹ️ Article already exists for PBS source:', pbsArticle.url)
      return false
    }
    
    // Generate leftist response
    const leftistArticle = await generateLeftistResponse(pbsArticle)
    
    // Create slug from title
    let baseSlug = leftistArticle.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100) // Limit slug length
    
    // Ensure unique slug
    let slug = baseSlug
    let counter = 1
    while (await Article.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Create new article
    const newArticle = new Article({
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
      publishedAt: null, // Will be set when published
      views: 0
    })
    
    await newArticle.save()
    console.log(`✅ Created new draft article: "${leftistArticle.title}"`)
    console.log(`🔗 Slug: ${slug}`)
    console.log(`📝 Article saved as draft for editing before publication`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error creating article from PBS:', error)
    throw error
  }
}

export async function monitorPBSAndCreateArticles(): Promise<{
  success: boolean
  articlesProcessed: number
  articlesCreated: number
  errors: string[]
}> {
  const result = {
    success: true,
    articlesProcessed: 0,
    articlesCreated: 0,
    errors: [] as string[]
  }

  try {
    console.log('🔍 Starting PBS NewsHour monitoring...')
    
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
        
        const created = await createArticleFromPBS(pbsArticle)
        if (created) {
          result.articlesCreated++
          console.log(`✅ Successfully created leftist response article`)
        } else {
          console.log(`ℹ️ Article already exists, skipping`)
        }
        
        // Add delay to avoid rate limiting
        if (result.articlesProcessed < pbsArticles.length) {
          console.log('⏳ Waiting 3 seconds before next article...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
        
      } catch (error) {
        const errorMsg = `Failed to process "${pbsArticle.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        result.errors.push(errorMsg)
        result.success = false
      }
    }
    
    console.log(`\n🎉 PBS monitoring completed!`)
    console.log(`📊 Summary: ${result.articlesCreated}/${result.articlesProcessed} articles created`)
    if (result.errors.length > 0) {
      console.log(`⚠️ Errors: ${result.errors.length}`)
    }
    
  } catch (error) {
    const errorMsg = `PBS monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error('💥', errorMsg)
    result.errors.push(errorMsg)
    result.success = false
  }

  return result
}