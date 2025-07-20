import cron from 'node-cron'
import dbConnect from './mongodb'
import mongoose from 'mongoose'
import OpenAI from 'openai'
import Article from '@/models/Article'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Scheduled Post schema
const ScheduledPostSchema = new mongoose.Schema({
  topic: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['politics', 'social-justice', 'labor'] },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
  customPrompt: { type: String, trim: true },
  recurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  errorMessage: { type: String },
  lastExecuted: { type: Date }
}, { timestamps: true })

const ScheduledPost = mongoose.models.ScheduledPost || mongoose.model('ScheduledPost', ScheduledPostSchema)

const LEFTIST_PROMPTS = {
  politics: `Write a progressive political news article from a leftist perspective that critiques corporate influence in politics, advocates for working-class interests, supports progressive policies like Medicare for All and Green New Deal, challenges establishment narratives, focuses on systemic issues rather than individual politicians, uses evidence-based analysis, and maintains journalistic integrity while advocating for social justice.`,
  
  'social-justice': `Write a social justice news article from a leftist perspective that centers marginalized voices and experiences, analyzes systemic oppression and inequality, advocates for civil rights and human dignity, challenges racist, sexist, and discriminatory systems, promotes intersectional analysis, supports community organizing and grassroots movements, and uses inclusive language and perspectives.`,
  
  labor: `Write a labor rights news article from a leftist perspective that supports workers' rights and union organizing, critiques corporate exploitation and wage theft, advocates for living wages and workplace safety, analyzes class struggle and economic inequality, promotes collective bargaining and worker solidarity, challenges anti-union propaganda, and focuses on worker empowerment and dignity.`
}

async function processScheduledPosts() {
  try {
    await dbConnect()
    
    const now = new Date()
    const pendingPosts = await ScheduledPost.aggregate([
      { $match: { status: 'pending', scheduledFor: { $lte: now } } }
    ])

    console.log(`Found ${pendingPosts.length} posts to process`)

    for (const post of pendingPosts) {
      try {
        console.log(`Processing post: ${post.topic}`)
        
        // Update status to generating
        post.status = 'generating'
        post.errorMessage = undefined
        await post.save()

        // Generate article using AI
        const basePrompt = LEFTIST_PROMPTS[post.category as keyof typeof LEFTIST_PROMPTS]
        const fullPrompt = post.customPrompt || `${basePrompt}

Topic: ${post.topic}

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
          throw new Error('No response from AI')
        }

        let articleData
        try {
          articleData = JSON.parse(response)
        } catch (parseError) {
          // Fallback if JSON parsing fails
          const lines = response.split('\n').filter(line => line.trim())
          const title = lines.find(line => line.includes('title') || line.includes('headline'))?.replace(/[^a-zA-Z0-9\s]/g, '') || `Progressive Analysis: ${post.topic}`
          
          articleData = {
            title: title.substring(0, 200),
            content: `<div class="article-content">${response.replace(/\n/g, '<br>')}</div>`,
            excerpt: `Progressive analysis of ${post.topic} from a leftist perspective.`,
            tags: [post.category, 'progressive', 'analysis']
          }
        }

        // Generate slug from title
        const slug = articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        // Create and save article
        const article = new Article({
          title: articleData.title,
          slug,
          content: articleData.content,
          excerpt: articleData.excerpt,
          category: post.category,
          tags: articleData.tags || [],
          author: 'AI Assistant',
          aiGenerated: true,
          published: true,
          publishedAt: new Date()
        })

        await article.save()

        // Update scheduled post
        post.status = 'completed'
        post.articleId = article._id
        post.lastExecuted = new Date()
        await post.save()

        console.log(`Successfully generated article: ${article.title}`)

        // Handle recurring posts
        if (post.recurring && post.recurringInterval) {
          const nextDate = new Date(post.scheduledFor)
          
          switch (post.recurringInterval) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1)
              break
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7)
              break
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1)
              break
          }

          // Create next scheduled post
          const nextPost = new ScheduledPost({
            topic: post.topic,
            category: post.category,
            scheduledFor: nextDate,
            customPrompt: post.customPrompt,
            recurring: true,
            recurringInterval: post.recurringInterval
          })

          await nextPost.save()
          console.log(`Created recurring post for: ${nextDate}`)
        }

      } catch (error: any) {
        console.error(`Error processing post ${post._id}:`, error)
        
        // Update post with error
        post.status = 'failed'
        post.errorMessage = error.message || 'Failed to generate article'
        await post.save()
      }
    }

  } catch (error) {
    console.error('Error in processScheduledPosts:', error)
  }
}

// Initialize scheduler
export function initializeScheduler() {
  // Run every 5 minutes to check for scheduled posts
  cron.schedule('*/5 * * * *', () => {
    console.log('Checking for scheduled posts...')
    processScheduledPosts()
  })

  console.log('Content scheduler initialized')
}

// Manual execution function for testing
export async function executeScheduledPosts() {
  await processScheduledPosts()
}