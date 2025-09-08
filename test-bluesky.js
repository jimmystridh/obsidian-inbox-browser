const { BlueskyAPIService } = require('./src/services/BlueskyAPIService');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');

async function testBlueskyImplementation() {
  console.log('📘 Testing Bluesky implementation...');

  // Test URLs with real Bluesky content
  const testUrls = [
    'https://bsky.app/profile/theguardian.com/post/3lycntc3zkb2p', // Real Guardian post
    'https://bsky.app/profile/alice.bsky.social/post/3kb2uqblah4z5', // Sample format for comparison
  ];

  console.log('\n=== Testing BlueskyAPIService directly ===');
  
  const blueskyAPI = new BlueskyAPIService();
  
  for (const url of testUrls) {
    try {
      console.log(`\n📘 Testing URL: ${url}`);
      
      // Test URL parsing
      const postInfo = blueskyAPI.extractPostURI(url);
      console.log('📝 Extracted post info:', postInfo);
      
      // Test if it's recognized as Bluesky URL
      console.log('🔍 Is Bluesky URL:', blueskyAPI.isBlueskyURL(url));
      
      // Try to fetch real metadata if it's the Guardian URL
      if (url.includes('theguardian.com')) {
        try {
          console.log('🚀 Attempting to fetch real post metadata...');
          const metadata = await blueskyAPI.fetchPostMetadata(url);
          console.log('✅ Successfully fetched metadata:');
          console.log('📝 Title:', metadata.title?.substring(0, 100) + '...');
          console.log('👤 Author:', metadata.author?.handle);
          console.log('📊 Metrics:', metadata.metrics);
        } catch (error) {
          console.log('❌ Failed to fetch real metadata:', error.message);
        }
      } else {
        console.log('⏭️  Skipping metadata fetch for sample URL');
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
    }
  }

  console.log('\n=== Testing MetadataFetcher integration ===');
  
  const metadataFetcher = new MetadataFetcher();
  
  try {
    // Test URL type detection
    for (const url of testUrls) {
      const urlType = metadataFetcher.getUrlType(url);
      console.log(`🏷️  URL type for ${url}: ${urlType}`);
    }
    
    // Try to fetch metadata for the Guardian URL
    const guardianUrl = testUrls.find(url => url.includes('theguardian.com'));
    if (guardianUrl) {
      try {
        console.log(`\n🔍 Testing MetadataFetcher with real URL: ${guardianUrl}`);
        const metadata = await metadataFetcher.fetchMetadata(guardianUrl);
        console.log('✅ MetadataFetcher result:');
        console.log('📰 Title:', metadata.title?.substring(0, 80) + '...');
        console.log('🎯 Platform:', metadata.platform);
        console.log('🔗 Source:', metadata.source);
      } catch (error) {
        console.log('❌ MetadataFetcher test failed:', error.message);
      }
    } else {
      console.log('⏭️  No real URL available for MetadataFetcher test');
    }
    
  } catch (error) {
    console.error('❌ MetadataFetcher test failed:', error.message);
  }

  console.log('\n=== Testing Credential Loading ===');
  
  try {
    const stats = blueskyAPI.getUsageStats();
    console.log('📊 Bluesky API Stats:', {
      authenticated: stats.authenticated,
      service: stats.service,
      hasCredentials: !!blueskyAPI.credentials
    });
    
    if (blueskyAPI.credentials) {
      console.log('✅ Bluesky credentials loaded successfully');
      console.log('🔑 Identifier:', blueskyAPI.credentials.identifier?.substring(0, 10) + '...');
    } else {
      console.log('ℹ️  No Bluesky credentials found - will use public endpoints only');
    }
    
  } catch (error) {
    console.error('❌ Credential test failed:', error.message);
  }

  console.log('\n=== Cleanup ===');
  
  try {
    await metadataFetcher.cleanup();
    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('⚠️  Cleanup had issues:', error.message);
  }

  console.log('\n🎉 Bluesky implementation testing completed!');
  console.log('\nℹ️  To test with real data:');
  console.log('1. Add valid Bluesky post URLs to the testUrls array');
  console.log('2. Optionally add BSKY_IDENTIFIER and BSKY_APP_PASSWORD to .env file');
  console.log('3. Run the test again');
}

// Run the test
if (require.main === module) {
  testBlueskyImplementation().catch(console.error);
}

module.exports = { testBlueskyImplementation };