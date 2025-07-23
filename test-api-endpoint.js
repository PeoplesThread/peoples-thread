// Test the PBS fetch API endpoint
const fetch = require('node-fetch');

async function testAPIEndpoint() {
  console.log('🧪 Testing PBS Fetch API endpoint...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/fetch-pbs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your_secret_pbs_monitor_key_here',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ API endpoint is working!');
      if (data.articles) {
        console.log(`📰 Found ${data.articles.length} relevant articles`);
        data.articles.forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
        });
      }
    } else {
      console.log('\n❌ API endpoint failed');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testAPIEndpoint();