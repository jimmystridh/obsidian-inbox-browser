const { TwitterAPIService } = require('./src/services/TwitterAPIService');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');

async function debugSpecificTweet() {
  const problematicUrl = 'https://x.com/juliaaneagu/status/1964704824299253888?s=12&t=tBkZCXBywtXBic7ilhQmmA';
  const tweetId = '1964704824299253888';
  
  console.log('🕵️  Debugging specific Twitter URL...');
  console.log('🔗 URL:', problematicUrl);
  console.log('🆔 Tweet ID:', tweetId);
  
  console.log('\n=== Step 1: Direct TwitterAPI Test ===');
  
  const twitterAPI = new TwitterAPIService();
  
  try {
    console.log('📞 Calling TwitterAPI.io directly...');
    const tweets = await twitterAPI.getTweetsByIds([tweetId]);
    console.log('📊 TwitterAPI response:', {
      success: tweets && tweets.length > 0,
      count: tweets ? tweets.length : 0,
      data: tweets && tweets.length > 0 ? tweets[0] : 'No data'
    });
  } catch (error) {
    console.error('❌ Direct TwitterAPI failed:', error.message);
  }
  
  console.log('\n=== Step 2: MetadataFetcher Test ===');
  
  const metadataFetcher = new MetadataFetcher();
  
  // First check cache
  console.log('💾 Checking cache first...');
  try {
    const cached = await metadataFetcher.cache.get(problematicUrl);
    if (cached) {
      console.log('🎯 Found in memory cache:', cached.title);
    } else {
      console.log('❌ Not in memory cache');
    }
  } catch (error) {
    console.log('❌ Memory cache check failed:', error.message);
  }
  
  // Check persistent cache
  try {
    const persistentCached = await metadataFetcher.persistentCache.get(problematicUrl);
    if (persistentCached) {
      console.log('🎯 Found in persistent cache:', persistentCached.title);
      console.log('📝 Cache source:', persistentCached.source);
      console.log('❌ Cache shows TwitterAPI failed previously');
      
      // Clear this from cache to force fresh fetch
      console.log('🗑️  Clearing cache entry to force fresh fetch...');
      await metadataFetcher.persistentCache.delete(problematicUrl);
      metadataFetcher.cache.delete(problematicUrl);
    } else {
      console.log('❌ Not in persistent cache');
    }
  } catch (error) {
    console.log('❌ Persistent cache check failed:', error.message);
  }
  
  console.log('\n=== Step 3: Fresh Metadata Fetch ===');
  
  try {
    console.log('🚀 Forcing fresh metadata fetch...');
    const metadata = await metadataFetcher.fetchMetadata(problematicUrl);
    console.log('✅ Fresh fetch result:');
    console.log('  📰 Title:', metadata.title);
    console.log('  📝 Description:', metadata.description?.substring(0, 100));
    console.log('  🔗 Source:', metadata.source);
    console.log('  👤 Author:', metadata.author);
    console.log('  🆔 Tweet ID:', metadata.tweetId);
    
    if (metadata.error) {
      console.log('❌ Error in metadata:', metadata.error);
    }
    
  } catch (error) {
    console.error('❌ Fresh fetch failed:', error.message);
  }
  
  console.log('\n=== Step 4: Direct API Test ===');
  
  // Test the API endpoint directly
  try {
    console.log('🧪 Testing TwitterAPI endpoint directly...');
    const testResponse = await fetch('http://localhost:6112/api/test-twitter/' + tweetId);
    const testResult = await testResponse.json();
    console.log('🧪 API test result:', testResult);
  } catch (error) {
    console.log('❌ API endpoint test failed (server may not be running):', error.message);
  }
  
  console.log('\n🕵️  Debug completed!');
}

if (require.main === module) {
  debugSpecificTweet().catch(console.error);
}

module.exports = { debugSpecificTweet };