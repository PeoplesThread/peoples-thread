const testMigration = async () => {
  try {
    console.log('Running article migration...')
    
    const response = await fetch('http://localhost:3001/api/admin/migrate-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Migration completed successfully!')
      console.log('Message:', result.message)
      console.log('Migrated:', result.migratedCount, 'out of', result.totalArticles, 'articles')
    } else {
      console.log('❌ Migration failed:', result.error)
      console.log('Details:', result.details)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the migration
testMigration()