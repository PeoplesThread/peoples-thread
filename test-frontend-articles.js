const testFrontendArticles = async () => {
  console.log('🚀 Testing frontend articles API...')

  try {
    console.log('📡 Fetching articles from frontend API...')
    const response = await fetch('http://localhost:3001/api/articles')

    console.log('📊 Response status:', response.status)

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Articles fetched successfully!')
      console.log('📋 Number of articles:', result.articles?.length || 0)
      console.log('💾 Data source:', result.source)
      console.log('📄 Articles:', result.articles?.map(a => ({ title: a.title, slug: a.slug, published: a.published })))
    } else {
      console.log('❌ Failed to fetch articles:', result.message)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Test featured articles too
const testFeaturedArticles = async () => {
  console.log('\n🌟 Testing featured articles...')

  try {
    const response = await fetch('http://localhost:3001/api/articles?featured=true')
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Featured articles fetched successfully!')
      console.log('📋 Number of featured articles:', result.articles?.length || 0)
      console.log('📄 Featured articles:', result.articles?.map(a => ({ title: a.title, featured: a.featured })))
    } else {
      console.log('❌ Failed to fetch featured articles:', result.message)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the tests
testFrontendArticles().then(() => testFeaturedArticles())