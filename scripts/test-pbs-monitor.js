// Test script for PBS monitoring
// Run with: node scripts/test-pbs-monitor.js

const { fetchPBSArticles, generateLeftistResponse } = require('../lib/pbsMonitor')

async function testPBSMonitor() {
  console.log('🔍 Testing PBS NewsHour monitoring...\n')
  
  try {
    // Test 1: Fetch PBS articles
    console.log('1. Fetching PBS articles...')
    const articles = await fetchPBSArticles()
    console.log(`✅ Found ${articles.length} relevant articles`)
    
    if (articles.length > 0) {
      const testArticle = articles[0]
      console.log(`📰 Test article: "${testArticle.title}"`)
      console.log(`🔗 URL: ${testArticle.url}`)
      console.log(`📝 Summary: ${testArticle.summary.substring(0, 100)}...\n`)
      
      // Test 2: Generate leftist response (only if OpenAI key is available)
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        console.log('2. Generating leftist response...')
        const response = await generateLeftistResponse(testArticle)
        console.log(`✅ Generated article: "${response.title}"`)
        console.log(`📂 Category: ${response.category}`)
        console.log(`🏷️ Tags: ${response.tags.join(', ')}`)
        console.log(`📄 Excerpt: ${response.excerpt}\n`)
      } else {
        console.log('⚠️ Skipping AI generation - OpenAI API key not configured')
      }
    } else {
      console.log('ℹ️ No relevant articles found with current keywords')
    }
    
    console.log('✅ PBS monitoring test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  }
}

// Run the test
testPBSMonitor()