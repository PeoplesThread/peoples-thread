// Test AI article generation
const fetch = require('node-fetch');

async function testAIGeneration() {
  console.log('🤖 Testing AI article generation...\n');
  
  // Test article data
  const testPBSArticle = {
    title: "Prime Minister Ishiba's coalition loses majority in Japan's upper house election",
    url: "https://www.pbs.org/newshour/world/prime-minister-ishibas-coalition-loses-majority-in-japans-upper-house-election",
    summary: "Japanese Prime Minister Shigeru Ishiba's ruling coalition failed Monday to secure a majority in the 248-seat upper house in a crucial parliamentary election, NHK public television said.",
    publishedDate: "Sun, 20 Jul 2025 18:07:57 -0400",
    content: "Japanese Prime Minister Shigeru Ishiba's ruling coalition failed Monday to secure a majority in the 248-seat upper house in a crucial parliamentary election, NHK public television said. The election results deal a significant blow to Ishiba's political standing and could complicate his ability to advance his policy agenda. The ruling Liberal Democratic Party (LDP) and its coalition partner Komeito won only 119 seats, falling short of the 125 needed for a majority in the upper house."
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/monitor-pbs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your_secret_pbs_monitor_key_here',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.details && data.details.errors && data.details.errors.length > 0) {
      console.log('\n❌ Errors found:');
      data.details.errors.forEach(error => {
        console.log(`- ${error}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testAIGeneration();