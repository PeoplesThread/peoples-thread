// Test the monitoring API
const fetch = require('node-fetch');

async function testMonitoring() {
  console.log('🧪 Testing PBS monitoring API...\n');
  
  try {
    console.log('📡 Triggering test monitoring...');
    
    const response = await fetch('http://localhost:3000/api/test-monitor-pbs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your_secret_pbs_monitor_key_here',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Monitoring completed!');
      console.log('📰 Message:', data.message);
      console.log('📊 Articles Processed:', data.details.articlesProcessed);
      console.log('📝 Articles Created:', data.details.articlesCreated);
      
      if (data.details.errors && data.details.errors.length > 0) {
        console.log('⚠️ Errors:');
        data.details.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      if (data.details.note) {
        console.log('💡 Note:', data.details.note);
      }
      
    } else {
      console.log('❌ Monitoring failed');
      console.log('📋 Error:', data.error);
      console.log('📋 Details:', data.details);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testMonitoring();