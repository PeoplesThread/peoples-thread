// Simple performance test for API endpoints
async function testAPI() {
  const testUrls = [
    'http://localhost:3002/api/articles',
    'http://localhost:3002/api/articles?category=politics',
    'http://localhost:3002/api/articles?category=social-justice',
  ];
  
  console.log('Testing API performance...\n');
  
  for (const url of testUrls) {
    const start = Date.now();
    try {
      const response = await fetch(url);
      const end = Date.now();
      const data = await response.json();
      console.log(`${url}`);
      console.log(`  Response time: ${end - start}ms`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Articles found: ${data.articles?.length || 0}`);
      console.log(`  Source: ${data.source || 'unknown'}\n`);
    } catch (error) {
      console.log(`${url}: Error - ${error.message}\n`);
    }
  }
}

testAPI().catch(console.error);