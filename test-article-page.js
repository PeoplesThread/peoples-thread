const testArticlePage = async () => {
  console.log('📄 Testing article page...')

  // Test the Trump article
  const articleSlug = 'trump-shrugs-off-epstein-questions-as-house-speaker-shuts-down-chamber-to-avoid-vote'
  
  try {
    console.log(`📡 Fetching article page: ${articleSlug}`)
    const response = await fetch(`http://localhost:3001/article/${articleSlug}`)

    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const html = await response.text()
      console.log('✅ Article page loaded successfully!')
      console.log('📄 HTML length:', html.length)
      
      // Check if the page contains article content
      const hasTitle = html.includes('Trump Shrugs Off Epstein Questions')
      const hasContent = html.includes('Partisan strife')
      const hasAuthor = html.includes('PalmerNet')
      
      console.log('🔍 Page analysis:')
      console.log('  - Article title:', hasTitle ? '✅' : '❌')
      console.log('  - Article content:', hasContent ? '✅' : '❌')
      console.log('  - Author info:', hasAuthor ? '✅' : '❌')
      
    } else {
      console.log('❌ Failed to load article page:', response.status)
      const text = await response.text()
      console.log('📄 Response:', text.substring(0, 500))
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Test the test article too
const testTestArticlePage = async () => {
  console.log('\n🧪 Testing test article page...')

  const articleSlug = 'test-article-enhanced-features'
  
  try {
    console.log(`📡 Fetching test article page: ${articleSlug}`)
    const response = await fetch(`http://localhost:3001/article/${articleSlug}`)

    console.log('📊 Response status:', response.status)

    if (response.ok) {
      console.log('✅ Test article page loaded successfully!')
    } else {
      console.log('❌ Failed to load test article page:', response.status)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the tests
testArticlePage().then(() => testTestArticlePage())