const https = require('https');

class TwitterAPIService {
  constructor(apiKey = '52ac69cc983a44038b652769e0b5fb03') {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.twitterapi.io';
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestDelay = 6000; // 6 seconds between API calls (TwitterAPI.io free tier: 5 seconds minimum)
    this.maxBatchSize = 100; // Maximum tweet IDs per batch request (up to 100 supported)
    this.lastRequestTime = 0;
    this.rateLimitResetTime = 0;
    this.maxRetries = 3;
  }

  async getTweetsByIds(tweetIds) {
    if (!Array.isArray(tweetIds)) {
      tweetIds = [tweetIds];
    }

    console.log(`🐦 TwitterAPI: Fetching ${tweetIds.length} tweets via TwitterAPI.io`);

    // Process in batches if needed
    const results = [];
    for (let i = 0; i < tweetIds.length; i += this.maxBatchSize) {
      const batch = tweetIds.slice(i, i + this.maxBatchSize);
      console.log(`📡 TwitterAPI: Processing batch ${i / this.maxBatchSize + 1} with ${batch.length} tweets`);
      const batchResults = await this.processTweetBatch(batch);
      results.push(...batchResults);
    }

    console.log(`🎯 TwitterAPI: Completed fetching, returning ${results.length} tweets`);
    return results;
  }

  async processTweetBatch(tweetIds, retryCount = 0) {
    const endpoint = '/twitter/tweets';
    const params = {
      tweet_ids: tweetIds.join(',')
    };

    try {
      // Enforce strict rate limiting
      await this.enforceRateLimit();
      
      const response = await this.makeAPIRequest(endpoint, params);
      
      if (response.success && response.data && response.data.tweets) {
        console.log(`✅ TwitterAPI: Successfully fetched ${response.data.tweets.length} tweets`);
        
        // Log successful API usage
        await this.logAPIUsage(endpoint, tweetIds, true);
        
        return this.normalizeTweetData(response.data.tweets);
      } else if (response.statusCode === 429) {
        // Rate limited - wait and retry
        console.log(`⏳ Rate limited - waiting ${this.requestDelay * 2}ms before retry (attempt ${retryCount + 1}/${this.maxRetries})`);
        
        if (retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.requestDelay * 2));
          return this.processTweetBatch(tweetIds, retryCount + 1);
        } else {
          throw new Error('Max retries exceeded - rate limited');
        }
      } else {
        console.error('Twitter API error:', response.error || 'Unknown error', response.response);
        
        // Log failed API usage
        await this.logAPIUsage(endpoint, tweetIds, false, new Error(response.error));
        
        return [];
      }
    } catch (error) {
      console.error(`❌ TwitterAPI: Request failed for tweet ${tweetIds.join(',')}: ${error.message}`);
      
      // Log failed API usage
      await this.logAPIUsage(endpoint, tweetIds, false, error);
      
      return [];
    }
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(`⏱️  TwitterAPI: Rate limiting, waiting ${Math.round(waitTime/1000)}s`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async getUserInfo(username) {
    const endpoint = '/twitter/get_user_by_username';
    const params = {
      screen_name: username
    };

    try {
      const response = await this.makeAPIRequest(endpoint, params);
      
      if (response.success && response.data) {
        console.log(`👤 Successfully fetched user info for @${username}`);
        return this.normalizeUserData(response.data);
      } else {
        console.error('User info API error:', response.error || 'Unknown error');
        return null;
      }
    } catch (error) {
      console.error('User info request failed:', error.message);
      return null;
    }
  }

  async makeAPIRequest(endpoint, params) {
    return new Promise((resolve, reject) => {
      const request = () => {
        try {
          // Build query string
          const queryString = new URLSearchParams(params).toString();
          const url = `${this.baseURL}${endpoint}?${queryString}`;

          const options = {
            method: 'GET',
            headers: {
              'X-API-Key': this.apiKey,
              'Content-Type': 'application/json',
              'User-Agent': 'ObsidianInboxBrowser/1.0'
            }
          };

          console.log(`📡 API Request: ${endpoint} (${Object.keys(params).length} params)`);
          console.log(`🔗 Full URL: ${url}`);

          const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              try {
                console.log(`📨 API Response: Status ${res.statusCode}, Data length: ${data.length}`);
                console.log(`📄 Raw response: ${data.substring(0, 500)}...`);
                
                const jsonData = JSON.parse(data);
                
                if (res.statusCode === 200) {
                  console.log(`✅ API Success: Got ${jsonData.data ? jsonData.data.length || 0 : 0} items`);
                  resolve({
                    success: true,
                    data: jsonData.data || jsonData,
                    meta: jsonData.meta
                  });
                } else {
                  console.log(`❌ API Error: ${res.statusCode} - ${jsonData.error || 'Unknown error'}`);
                  resolve({
                    success: false,
                    error: jsonData.error || `HTTP ${res.statusCode}`,
                    statusCode: res.statusCode,
                    response: data
                  });
                }
              } catch (parseError) {
                console.error(`🚫 Parse error: ${parseError.message}`);
                console.log(`📄 Unparseable response: ${data}`);
                reject(new Error(`Failed to parse API response: ${parseError.message}`));
              }
            });
          });

          req.on('error', (error) => {
            reject(new Error(`API request failed: ${error.message}`));
          });

          req.on('timeout', () => {
            req.destroy();
            reject(new Error('API request timeout'));
          });

          req.setTimeout(10000); // 10 second timeout
          req.end();

        } catch (error) {
          reject(error);
        }
      };

      // Add to queue for rate limiting
      this.requestQueue.push(request);
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      try {
        await request();
      } catch (error) {
        console.error(`Queue request failed: ${error.message}`);
      }
      
      // Enforce rate limiting between ALL requests
      if (this.requestQueue.length > 0) {
        console.log(`⏱️ TwitterAPI rate limiting: waiting ${this.requestDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }
    }
    
    this.isProcessing = false;
  }

  normalizeTweetData(tweets) {
    return tweets.map(tweet => ({
      id: tweet.id,
      text: tweet.text || '',
      user: {
        id: tweet.author?.id,
        username: tweet.author?.userName || '',
        displayName: tweet.author?.name || '',
        verified: tweet.author?.isVerified || tweet.author?.isBlueVerified || false,
        profileImage: tweet.author?.profilePicture,
        description: tweet.author?.description || '',
        followersCount: tweet.author?.followers || 0,
        followingCount: tweet.author?.following || 0
      },
      createdAt: tweet.createdAt,
      metrics: {
        likes: tweet.likeCount || 0,
        retweets: tweet.retweetCount || 0,
        replies: tweet.replyCount || 0,
        quotes: tweet.quoteCount || 0,
        views: tweet.viewCount || 0,
        bookmarks: tweet.bookmarkCount || 0
      },
      isRetweet: tweet.isRetweet || false,
      isReply: tweet.isReply || false,
      isQuote: tweet.isQuote || false,
      lang: tweet.lang,
      source: tweet.source,
      entities: tweet.entities || {},
      media: tweet.extendedEntities?.media || [],
      urls: tweet.entities?.urls || []
    }));
  }

  normalizeUserData(user) {
    return {
      id: user.id_str || user.id,
      username: user.screen_name || '',
      displayName: user.name || '',
      description: user.description || '',
      verified: user.verified || false,
      profileImage: user.profile_image_url_https || user.profile_image_url,
      bannerImage: user.profile_banner_url,
      location: user.location,
      website: user.url,
      createdAt: user.created_at,
      metrics: {
        followers: user.followers_count || 0,
        following: user.friends_count || 0,
        tweets: user.statuses_count || 0,
        likes: user.favourites_count || 0
      },
      protected: user.protected || false
    };
  }

  extractTweetIdFromUrl(url) {
    // Extract tweet ID from various Twitter URL formats
    const tweetIdMatch = url.match(/status\/(\d+)/);
    return tweetIdMatch ? tweetIdMatch[1] : null;
  }

  extractUsernameFromUrl(url) {
    // Extract username from Twitter URL
    const usernameMatch = url.match(/(?:twitter\.com|x\.com)\/([^/]+)/);
    return usernameMatch ? usernameMatch[1] : null;
  }

  // Batch process multiple tweet URLs efficiently
  async processTweetUrls(urls) {
    const tweetIds = [];
    const urlToIdMap = new Map();

    // Extract all tweet IDs
    urls.forEach(url => {
      const tweetId = this.extractTweetIdFromUrl(url);
      if (tweetId) {
        tweetIds.push(tweetId);
        urlToIdMap.set(tweetId, url);
      }
    });

    if (tweetIds.length === 0) {
      return [];
    }

    // Fetch tweets in batch
    const tweets = await this.getTweetsByIds(tweetIds);
    
    // Map back to original URLs
    return tweets.map(tweet => ({
      ...tweet,
      originalUrl: urlToIdMap.get(tweet.id)
    }));
  }

  // Get API usage stats (if supported by the API)
  async getUsageStats() {
    try {
      // This endpoint might not exist, but worth trying
      const response = await this.makeAPIRequest('/twitter/usage', {});
      return response.data;
    } catch (error) {
      console.log('Usage stats not available');
      return null;
    }
  }

  // Cost estimation and monitoring
  estimateCost(tweetIds) {
    // Based on typical Twitter API pricing
    const costPerTweet = 0.001; // Estimate $0.001 per tweet
    return tweetIds.length * costPerTweet;
  }

  // Track API usage locally
  async logAPIUsage(endpoint, tweetIds, success, error = null) {
    const usage = {
      timestamp: new Date().toISOString(),
      endpoint,
      tweetCount: Array.isArray(tweetIds) ? tweetIds.length : 1,
      estimatedCost: this.estimateCost(Array.isArray(tweetIds) ? tweetIds : [tweetIds]),
      success,
      error: error?.message || null
    };

    console.log(`💰 API Usage:`, usage);
    
    // In a production app, you'd store this in SQLite for analytics
    return usage;
  }

  // Get cached usage statistics
  async getUsageStatsFromCache() {
    // This would query SQLite for usage history
    // For now, return a placeholder
    return {
      totalCalls: 0,
      totalTweets: 0,
      estimatedCost: 0,
      successRate: 100,
      lastCall: null
    };
  }
}

module.exports = { TwitterAPIService };