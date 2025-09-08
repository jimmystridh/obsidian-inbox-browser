const { BlueskyAPIService } = require('./src/services/BlueskyAPIService');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');

async function testBlueskyImplementation() {
  console.log('📘 Testing Bluesky implementation...');

  // Test URLs (these are sample formats - replace with real URLs when testing)
  const testUrls = [
    'https://bsky.app/profile/alice.bsky.social/post/3kb2uqblah4z5', // Sample Bluesky post URL format
    'https://staging.bsky.app/profile/test.bsky.social/post/abc123def456', // Staging version
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
      
      // Note: Actual fetching would require valid post URLs and potentially credentials
      console.log('⏭️  Metadata fetching test skipped (requires valid Bluesky post URLs)');
      
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
    
    console.log('⏭️  Metadata fetching test skipped (requires valid Bluesky post URLs with real content)');
    
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