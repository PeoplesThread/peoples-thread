const testArticleCreation = async () => {
  const testArticle = {
    title: "Test Article - Enhanced Features",
    content: "This is a test article to verify that all the new enhanced features are working properly. The article creation system now supports advanced customization options including SEO settings, social media optimization, and custom styling.",
    excerpt: "A test article to verify enhanced article creation features work correctly.",
    category: "politics",
    tags: "test, enhanced, features",
    author: "Test Author",
    published: true,
    featured: false,
    metaDescription: "Test article for verifying enhanced article creation features",
    readingTime: "2 min read",
    difficulty: "beginner",
    priority: "normal",
    socialTitle: "Test Article with Enhanced Features",
    socialDescription: "Testing the new enhanced article creation system",
    enableComments: true,
    enableNewsletter: true,
    customCSS: ".test-style { color: #333; }",
    customJS: "console.log('Test article loaded');"
  }

  console.log('🚀 Starting article creation test...')
  console.log('📝 Article data:', JSON.stringify(testArticle, null, 2))

  try {
    console.log('📡 Sending request to API...')
    const response = await fetch('http://localhost:3001/api/admin/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testArticle)
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📄 Raw response:', responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.log('❌ Failed to parse JSON response')
      console.log('Raw response was:', responseText)
      return
    }
    
    if (response.ok) {
      console.log('✅ Article created successfully!')
      console.log('📋 Result:', result)
      console.log('🆔 Article ID:', result.article?._id)
      console.log('🔗 Article slug:', result.article?.slug)
      console.log('💾 Data source:', result.source)
    } else {
      console.log('❌ Failed to create article:', result.error)
      console.log('📝 Details:', result.details)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
    console.log('🔍 Full error:', error)
  }
}

// Run the test
testArticleCreation()