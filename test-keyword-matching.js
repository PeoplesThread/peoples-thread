// Test keyword matching with current PBS articles
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testKeywordMatching() {
  console.log('🔍 Testing keyword matching with PBS articles...\n');
  
  try {
    // Load keywords
    const keywordsFile = path.join(process.cwd(), 'data', 'keywords.json');
    const keywords = JSON.parse(fs.readFileSync(keywordsFile, 'utf-8'));
    console.log(`📋 Using ${keywords.length} monitored keywords:`, keywords.slice(0, 10).join(', '), '...\n');
    
    // Fetch RSS feed
    const response = await fetch('https://www.pbs.org/newshour/feeds/rss/headlines', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PeoplesThread/1.0; +https://peoplesthread.com)'
      }
    });
    
    const rssText = await response.text();
    const itemMatches = rssText.match(/<item[^>]*>(.*?)<\/item>/gs);
    
    console.log(`📰 Analyzing ${itemMatches.length} articles for keyword matches...\n`);
    
    let matchedArticles = 0;
    
    for (let i = 0; i < Math.min(itemMatches.length, 10); i++) {
      const item = itemMatches[i];
      
      // Extract title and description
      const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
      const descMatch = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
      
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const summary = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        const searchText = `${title} ${summary}`.toLowerCase();
        
        console.log(`📝 Article ${i + 1}: "${title}"`);
        console.log(`📄 Summary: ${summary.substring(0, 100)}...`);
        
        // Check for keyword matches
        const matchedKeywords = keywords.filter(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        
        if (matchedKeywords.length > 0) {
          console.log(`✅ MATCHED! Keywords: ${matchedKeywords.join(', ')}`);
          matchedArticles++;
        } else {
          console.log(`❌ No keyword matches`);
        }
        console.log('---');
      }
    }
    
    console.log(`\n📊 Summary: ${matchedArticles} out of ${Math.min(itemMatches.length, 10)} articles matched keywords`);
    
    if (matchedArticles === 0) {
      console.log('\n🔍 Let\'s check what topics are actually in the current articles:');
      for (let i = 0; i < Math.min(itemMatches.length, 5); i++) {
        const item = itemMatches[i];
        const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
        if (titleMatch) {
          console.log(`- ${titleMatch[1].trim()}`);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testKeywordMatching();