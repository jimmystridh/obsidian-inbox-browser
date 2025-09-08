const { ThreadsAPIService } = require('./src/services/ThreadsAPIService');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');

async function testThreadsImplementation() {
  console.log('🧪 Testing Threads implementation...');

  // Test URLs from the scraping guide
  const testUrls = [
    'https://www.threads.net/@natgeo/post/C8H5FiCtESk', // Thread from guide
    'https://www.threads.net/@natgeo', // Profile from guide
    'https://www.threads.net/t/C8H5FiCtESk', // Alternative URL format
  ];

  console.log('\\n=== Testing ThreadsAPIService directly ===');
  
  const threadsAPI = new ThreadsAPIService();
  
  for (const url of testUrls) {
    try {
      console.log(`\\n🧵 Testing: ${url}`);
      const urlType = threadsAPI.getURLType(url);
      console.log(`📝 URL Type: ${urlType}`);
      
      // Note: Direct testing would require browser automation
      // For now just test URL type detection
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
    }
  }

  console.log('\\n=== Testing MetadataFetcher integration ===');
  
  const metadataFetcher = new MetadataFetcher();
  
  try {
    // Test metadata fetching for a simple Threads URL
    const sampleUrl = testUrls[0];
    console.log(`\\n🔍 Testing metadata fetch for: ${sampleUrl}`);
    
    // This would actually try to scrape - comment out for now to avoid rate limits
    // const metadata = await metadataFetcher.fetchMetadata(sampleUrl);
    // console.log('✅ Metadata result:', JSON.stringify(metadata, null, 2));
    
    console.log('⏭️  Metadata fetching test skipped (would require live scraping)');
    
  } catch (error) {
    console.error('❌ MetadataFetcher test failed:', error.message);
  }

  console.log('\\n=== Testing URL Type Detection ===');
  
  const testItems = [
    {
      content: 'Check out this post https://www.threads.net/@natgeo/post/C8H5FiCtESk',
      urls: ['https://www.threads.net/@natgeo/post/C8H5FiCtESk'],
      timestamp: '2024-09-08 08:00:00'
    },
    {
      content: 'Interesting tech discussion https://www.threads.net/@github/post/ABC123',
      urls: ['https://www.threads.net/@github/post/ABC123'],
      timestamp: '2024-09-08 14:30:00'
    }
  ];

  for (const item of testItems) {
    console.log(`\\n🔗 Testing URL recognition for: ${item.content}`);
    for (const url of item.urls) {
      const urlType = metadataFetcher.getUrlType(url);
      console.log(`  📝 ${url} -> ${urlType}`);
    }
  }

  console.log('\\n=== Cleanup ===');
  
  try {
    await threadsAPI.closeBrowser();
    await metadataFetcher.cleanup();
    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('⚠️  Cleanup had issues:', error.message);
  }

  console.log('\\n🎉 Threads implementation testing completed!');
}

// Run the test
if (require.main === module) {
  testThreadsImplementation().catch(console.error);
}

module.exports = { testThreadsImplementation };