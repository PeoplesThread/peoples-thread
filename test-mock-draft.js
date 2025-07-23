// Test mock draft generation API
const fetch = require('node-fetch');

async function testMockDraftGeneration() {
  console.log('🧪 Testing mock draft generation API...\n');
  
  // Test article data
  const testPBSArticle = {
    title: "Prime Minister Ishiba's coalition loses majority in Japan's upper house election",
    url: "https://www.pbs.org/newshour/world/prime-minister-ishibas-coalition-loses-majority-in-japans-upper-house-election",
    summary: "Japanese Prime Minister Shigeru Ishiba's ruling coalition failed Monday to secure a majority in the 248-seat upper house in a crucial parliamentary election, NHK public television said.",
    publishedDate: "Sun, 20 Jul 2025 18:07:57 -0400",
    content: "Japanese Prime Minister Shigeru Ishiba's ruling coalition failed Monday to secure a majority in the 248-seat upper house in a crucial parliamentary election, NHK public television said. The election results deal a significant blow to Ishiba's political standing and could complicate his ability to advance his policy agenda. The ruling Liberal Democratic Party (LDP) and its coalition partner Komeito won only 119 seats, falling short of the 125 needed for a majority in the upper house."
  };
  
  try {
    console.log('📝 Generating mock draft for:', testPBSArticle.title);
    
    const response = await fetch('http://localhost:3000/api/generate-mock-draft', {
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
      console.log('✅ Mock draft generated successfully!');
      console.log('📰 Title:', data.draft.title);
      console.log('📂 Category:', data.draft.category);
      console.log('🏷️ Tags:', data.draft.tags.join(', '));
      console.log('📄 Excerpt:', data.draft.excerpt.substring(0, 100) + '...');
      console.log('📝 Content length:', data.draft.content.length, 'characters');
      console.log('💡 Note:', data.note);
      
      // Test saving the draft locally
      console.log('\n📁 Testing local draft save...');
      const saveResponse = await fetch('http://localhost:3000/api/test-save-draft', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer your_secret_pbs_monitor_key_here',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data.draft,
          published: false
        })
      });
      
      const saveData = await saveResponse.json();
      
      if (saveResponse.ok && saveData.success) {
        console.log('✅ Draft saved locally!');
        console.log('🔗 Slug:', saveData.article.slug);
        console.log('📂 ID:', saveData.article.id);
      } else {
        console.log('❌ Failed to save draft:', saveData.error);
      }
      
    } else {
      console.log('❌ Mock draft generation failed');
      console.log('📋 Error:', data.error);
      console.log('📋 Details:', data.details);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testMockDraftGeneration();