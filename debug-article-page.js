const fs = require('fs')
const path = require('path')

console.log('🔍 Debugging article page issues...')

// Test file system access
const articlesFilePath = path.join(process.cwd(), 'data', 'articles.json')
console.log('📁 Articles file path:', articlesFilePath)
console.log('📁 File exists:', fs.existsSync(articlesFilePath))

if (fs.existsSync(articlesFilePath)) {
  try {
    const data = fs.readFileSync(articlesFilePath, 'utf8')
    const articles = JSON.parse(data)
    console.log('📋 Number of articles in file:', articles.length)
    console.log('📋 Article slugs:', articles.map(a => a.slug))
    
    // Test finding the specific article
    const targetSlug = 'trump-shrugs-off-epstein-questions-as-house-speaker-shuts-down-chamber-to-avoid-vote'
    const article = articles.find(a => a.slug === targetSlug && a.published)
    console.log('🎯 Target article found:', !!article)
    if (article) {
      console.log('📄 Article title:', article.title)
      console.log('📄 Article published:', article.published)
    }
    
  } catch (error) {
    console.error('❌ Error reading articles file:', error)
  }
} else {
  console.log('❌ Articles file does not exist')
}