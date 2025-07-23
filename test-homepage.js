const testHomepage = async () => {
  console.log('🏠 Testing homepage...')

  try {
    console.log('📡 Fetching homepage...')
    const response = await fetch('http://localhost:3001/')

    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const html = await response.text()
      console.log('✅ Homepage loaded successfully!')
      console.log('📄 HTML length:', html.length)
      
      // Check if the page contains our components
      const hasFeaturedSection = html.includes('Featured Stories')
      const hasLatestCoverage = html.includes('Latest Coverage')
      const hasPoliticsSection = html.includes('Politics')
      
      console.log('🔍 Page analysis:')
      console.log('  - Featured Stories section:', hasFeaturedSection ? '✅' : '❌')
      console.log('  - Latest Coverage section:', hasLatestCoverage ? '✅' : '❌')
      console.log('  - Politics section:', hasPoliticsSection ? '✅' : '❌')
      
    } else {
      console.log('❌ Failed to load homepage:', response.status)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the test
testHomepage()