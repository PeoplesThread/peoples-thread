// Simple test to check PBS RSS feed
const fetch = require('node-fetch');

async function testPBSRSSFeed() {
  console.log('🧪 Testing PBS NewsHour RSS feed...\n');
  
  try {
    const response = await fetch('https://www.pbs.org/newshour/feeds/rss/headlines', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PeoplesThread/1.0; +https://peoplesthread.com)'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Content Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const rssText = await response.text();
      console.log('✅ RSS feed fetched successfully!');
      console.log('📄 Content length:', rssText.length, 'characters');
      
      // Parse RSS feed to count articles
      const itemMatches = rssText.match(/<item[^>]*>(.*?)<\/item>/gs);
      if (itemMatches) {
        console.log(`📰 Found ${itemMatches.length} articles in RSS feed`);
        
        // Show first article title as example
        const firstItem = itemMatches[0];
        const titleMatch = firstItem.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
        if (titleMatch) {
          console.log(`📝 First article: "${titleMatch[1].trim()}"`);
        }
      } else {
        console.log('⚠️ No articles found in RSS feed');
      }
    } else {
      console.log('❌ Failed to fetch RSS feed:', response.statusText);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testPBSRSSFeed();