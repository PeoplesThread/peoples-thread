const testArticleAPI = async () => {
  console.log('🔗 Testing individual article API...')

  // Test the Trump article
  const articleSlug = 'trump-shrugs-off-epstein-questions-as-house-speaker-shuts-down-chamber-to-avoid-vote'
  
  try {
    console.log(`📡 Fetching article API: ${articleSlug}`)
    const response = await fetch(`http://localhost:3001/api/articles/${articleSlug}`)

    console.log('📊 Response status:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Article API working!')
      console.log('📋 Article title:', result.article?.title)
      console.log('📋 Article slug:', result.article?.slug)
      console.log('📋 Article views:', result.article?.views)
      console.log('💾 Data source:', result.source)
      
    } else {
      const error = await response.json()
      console.log('❌ Failed to fetch article:', error.message)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Test the test article too
const testTestArticleAPI = async () => {
  console.log('\n🧪 Testing test article API...')

  const articleSlug = 'test-article-enhanced-features'
  
  try {
    console.log(`📡 Fetching test article API: ${articleSlug}`)
    const response = await fetch(`http://localhost:3001/api/articles/${articleSlug}`)

    console.log('📊 Response status:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Test article API working!')
      console.log('📋 Article title:', result.article?.title)
    } else {
      const error = await response.json()
      console.log('❌ Failed to fetch test article:', error.message)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the tests
testArticleAPI().then(() => testTestArticleAPI())