const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function migrateArticles() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const collection = db.collection('articles')
    
    // Get all articles
    const articles = await collection.find({}).toArray()
    console.log(`Found ${articles.length} articles to migrate`)
    
    // Update each article with new fields
    for (const article of articles) {
      const updateData = {
        difficulty: article.difficulty || 'beginner',
        priority: article.priority || 'normal',
        enableComments: article.enableComments !== undefined ? article.enableComments : true,
        enableNewsletter: article.enableNewsletter !== undefined ? article.enableNewsletter : true,
        metaDescription: article.metaDescription || article.excerpt?.substring(0, 160) || '',
        readingTime: article.readingTime || '',
        socialTitle: article.socialTitle || '',
        socialDescription: article.socialDescription || '',
        customCSS: article.customCSS || '',
        customJS: article.customJS || ''
      }
      
      await collection.updateOne(
        { _id: article._id },
        { $set: updateData }
      )
    }
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await client.close()
  }
}

migrateArticles()