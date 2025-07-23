const puppeteer = require('puppeteer');

async function testPagePerformance(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable performance monitoring
  await page.setCacheEnabled(false);
  
  const startTime = Date.now();
  
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    console.log(`\n=== Performance Test Results for ${url} ===`);
    console.log(`Total Load Time: ${loadTime}ms`);
    console.log(`DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`Load Complete: ${performanceMetrics.loadComplete.toFixed(2)}ms`);
    console.log(`First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`);
    console.log(`First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);
    
    return {
      url,
      totalLoadTime: loadTime,
      ...performanceMetrics
    };
    
  } catch (error) {
    console.error(`Error testing ${url}:`, error.message);
    return null;
  } finally {
    await browser.close();
  }
}

async function runTests() {
  const baseUrl = 'http://localhost:3002';
  const testUrls = [
    `${baseUrl}`,
    `${baseUrl}/category/politics`,
    `${baseUrl}/category/social-justice`,
  ];
  
  console.log('Starting performance tests...\n');
  
  for (const url of testUrls) {
    await testPagePerformance(url);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  runTests().catch(console.error);
} catch (e) {
  console.log('Puppeteer not installed. Install it with: npm install puppeteer');
  console.log('Running basic fetch test instead...\n');
  
  // Fallback to simple fetch test
  async function simpleFetchTest() {
    const testUrls = [
      'http://localhost:3002/api/articles',
      'http://localhost:3002/api/articles?category=politics',
    ];
    
    for (const url of testUrls) {
      const start = Date.now();
      try {
        const response = await fetch(url);
        const end = Date.now();
        console.log(`${url}: ${end - start}ms (${response.status})`);
      } catch (error) {
        console.log(`${url}: Error - ${error.message}`);
      }
    }
  }
  
  simpleFetchTest().catch(console.error);
}