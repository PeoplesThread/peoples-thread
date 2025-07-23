// Simple test script for PBS monitoring
// Run with: node scripts/test-pbs-simple.js

const fetch = require('node-fetch')

async function testPBSEndpoint() {
  console.log('🧪 Testing PBS Monitor API endpoint...\n')
  
  try {
    const response = await fetch('http://localhost:3001/api/monitor-pbs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your-secret-key',
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    console.log('📊 Response Status:', response.status)
    console.log('📋 Response Data:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('\n✅ API endpoint is working!')
      if (data.details) {
        console.log(`📰 Articles processed: ${data.details.articlesProcessed}`)
        console.log(`✨ Articles created: ${data.details.articlesCreated}`)
        if (data.details.errors?.length > 0) {
          console.log(`⚠️ Errors: ${data.details.errors.length}`)
        }
      }
    } else {
      console.log('\n❌ API endpoint failed')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run the test
testPBSEndpoint()