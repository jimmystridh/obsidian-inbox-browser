const { ThreadsAPIService } = require('./src/services/ThreadsAPIService');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');

async function testThreadsImplementation() {
  console.log('🧪 Testing Threads implementation...');

  // Test URLs from the scraping guide and real examples
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
    // Test live scraping for multiple URLs
    console.log('\\n🚀 Testing live scraping for all URLs...');
    
    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      console.log(`\\n🔍 [${i + 1}/${testUrls.length}] Testing: ${url}`);
      
      try {
        const metadata = await metadataFetcher.fetchMetadata(url);
        console.log('✅ Live scraping result:');
        console.log('  📰 Title:', metadata.title);
        console.log('  📝 Description:', metadata.description?.substring(0, 80) + '...');
        console.log('  🖼️  Image:', metadata.image ? 'Present' : 'None');
        console.log('  🎯 Platform:', metadata.platform);
        console.log('  🔗 Source:', metadata.source);
        
        if (metadata.metrics) {
          console.log('  📊 Metrics:', metadata.metrics);
        }
        
        if (metadata.author) {
          console.log('  👤 Author:', metadata.author);
          console.log('  ✅ Verified:', metadata.verified || false);
        }
        
        // Add delay between requests to be respectful
        if (i < testUrls.length - 1) {
          console.log('  ⏳ Waiting 3 seconds before next request...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        console.error(`  ❌ Failed to fetch metadata for ${url}:`, error.message);
      }
    }
    
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