// Test draft generation API
const fetch = require('node-fetch');

async function testDraftGeneration() {
  console.log('🧪 Testing draft generation API...\n');
  
  // Test article data
  const testPBSArticle = {
    title: "Prime Minister Ishiba's coalition loses majority in Japan's upper house election",
    url: "https://www.pbs.org/newshour/world/prime-minister-ishibas-coalition-loses-majority-in-japans-upper-house-election",
    summary: "Japanese Prime Minister Shigeru Ishiba's ruling coalition failed Monday to secure a majority in the 248-seat upper house in a crucial parliamentary election, NHK public television said.",
    publishedDate: "Sun, 20 Jul 2025 18:07:57 -0400",
    content: "Japanese Prime Minister Shigeru Ishiba's ruling coalition failed Monday to secure a majority in the 248-seat upper house in a crucial parliamentary election, NHK public television said. The election results deal a significant blow to Ishiba's political standing and could complicate his ability to advance his policy agenda. The ruling Liberal Democratic Party (LDP) and its coalition partner Komeito won only 119 seats, falling short of the 125 needed for a majority in the upper house."
  };
  
  try {
    console.log('📝 Generating draft for:', testPBSArticle.title);
    
    const response = await fetch('http://localhost:3000/api/generate-draft', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your_secret_pbs_monitor_key_here',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pbsArticle: testPBSArticle })
    });
    
    console.log('📊 Response Status:', response.status);
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Draft generated successfully!');
      console.log('📰 Title:', data.draft.title);
      console.log('📂 Category:', data.draft.category);
      console.log('🏷️ Tags:', data.draft.tags.join(', '));
      console.log('📄 Excerpt:', data.draft.excerpt.substring(0, 100) + '...');
      console.log('📝 Content length:', data.draft.content.length, 'characters');
    } else {
      console.log('❌ Draft generation failed');
      console.log('📋 Error:', data.error);
      console.log('📋 Details:', data.details);
      
      if (data.error === 'OpenAI API key not configured') {
        console.log('\n💡 To fix this:');
        console.log('1. Get an OpenAI API key from https://platform.openai.com/api-keys');
        console.log('2. Update your .env.local file:');
        console.log('   OPENAI_API_KEY=your_actual_api_key_here');
        console.log('3. Restart the development server');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testDraftGeneration();