const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const { PersistentCache } = require('./PersistentCache');
const { TwitterAPIService } = require('./TwitterAPIService');
const { ThreadsAPIService } = require('./ThreadsAPIService');
const { BlueskyAPIService } = require('./BlueskyAPIService');

class MetadataFetcher {
  constructor() {
    // Keep in-memory cache for session
    this.cache = new Map();
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Persistent cache with SQLite
    this.persistentCache = new PersistentCache('./cache', 24 * 60 * 60 * 1000);
    
    // API services
    this.twitterAPI = new TwitterAPIService();
    this.threadsAPI = new ThreadsAPIService();
    this.blueskyAPI = new BlueskyAPIService();
    
    // Enhanced rate limiting (excluding Twitter which uses TwitterAPI)
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestDelay = 1000; // 1 second between requests (non-Twitter)
    this.domainDelays = {
      'threads.net': 2000,     // 2 seconds for Threads
      'bsky.app': 1000,        // 1 second for Bluesky
      'youtube.com': 1000,     // 1 second for YouTube
      'github.com': 500,       // 0.5 seconds for GitHub
      'linkedin.com': 2000     // 2 seconds for LinkedIn
    };
    
    // Schedule periodic cleanup
    setInterval(() => {
      this.persistentCache.scheduledCleanup();
    }, 60 * 60 * 1000); // Every hour
  }

  async fetchMetadata(url) {
    console.log(`🔍 Fetching metadata for: ${url}`);
    
    // Check in-memory cache first (fastest)
    if (this.cache.has(url)) {
      console.log(`💾 Using in-memory cache for: ${url}`);
      return this.cache.get(url);
    }

    // Check persistent cache (SQLite)
    try {
      const cachedMetadata = await this.persistentCache.get(url);
      if (cachedMetadata) {
        // Also store in memory for this session
        this.cache.set(url, cachedMetadata);
        return cachedMetadata;
      }
    } catch (error) {
      console.log(`⚠️  Error reading from persistent cache: ${error.message}`);
    }

    // Not in cache, fetch fresh data
    try {
      const urlType = this.getUrlType(url);
      console.log(`🏷️  URL type identified as: ${urlType}`);
      
      const metadata = await this.processUrl(url);
      
      // Cache the result in both caches
      this.cache.set(url, metadata);
      
      // Cache in SQLite with type-specific TTL
      const ttl = this.persistentCache.getTTLForType(urlType);
      await this.persistentCache.set(url, metadata, ttl);
      
      console.log(`✅ Successfully fetched and cached metadata for ${url}: ${metadata.title}`);
      
      return metadata;
    } catch (error) {
      console.error(`❌ Error fetching metadata for ${url}:`, error.message);
      
      // Create fallback metadata
      const fallbackMetadata = {
        url,
        title: this.extractDomainName(url),
        description: 'Failed to load metadata',
        image: null,
        type: this.getUrlType(url),
        error: error.message,
        fallback: true
      };
      
      // Cache the fallback for a short time to avoid repeated failures
      const shortTTL = 30 * 60 * 1000; // 30 minutes
      await this.persistentCache.set(url, fallbackMetadata, shortTTL);
      
      return fallbackMetadata;
    }
  }

  async processUrl(url) {
    const urlType = this.getUrlType(url);
    
    switch (urlType) {
      case 'twitter':
      case 'x':
        return await this.fetchTwitterMetadata(url);
      case 'threads':
        return await this.fetchThreadsMetadata(url);
      case 'bluesky':
        return await this.fetchBlueskyMetadata(url);
      case 'youtube':
        return await this.fetchYouTubeMetadata(url);
      case 'github':
        return await this.fetchGitHubMetadata(url);
      case 'linkedin':
        return await this.fetchLinkedInMetadata(url);
      case 'spotify':
        return await this.fetchSpotifyMetadata(url);
      default:
        return await this.fetchGenericMetadata(url);
    }
  }

  async fetchTwitterMetadata(url) {
    const tweetId = url.match(/status\/(\d+)/)?.[1];
    const username = this.twitterAPI.extractUsernameFromUrl(url);
    
    if (!tweetId) {
      console.log(`❌ No tweet ID found in URL: ${url}`);
      return this.createEnhancedFallback(url, username, null);
    }

    console.log(`🐦 Processing Twitter URL: ${url} (ID: ${tweetId}, User: @${username})`);

    // Check cache first for this specific tweet ID
    try {
      const cachedTweet = await this.persistentCache.getTwitterDataByTweetId(tweetId);
      if (cachedTweet) {
        console.log(`💾 Using cached TwitterAPI data for tweet ${tweetId}`);
        return cachedTweet;
      }
    } catch (error) {
      console.log(`⚠️ Error checking Twitter cache: ${error.message}`);
    }

    // Try TwitterAPI.io first (best quality)
    try {
      const tweets = await this.twitterAPI.getTweetsByIds([tweetId]);
      
      if (tweets && tweets.length > 0) {
        const tweet = tweets[0];
        console.log(`✅ Got rich Twitter data via API: "${tweet.text.substring(0, 50)}..."`);
        
        // Cache the rich Twitter data
        await this.persistentCache.cacheTwitterAPIData(tweet, url);
        
        // Return formatted metadata
        return {
          url,
          title: `@${tweet.user.username}: ${tweet.text.substring(0, 80)}${tweet.text.length > 80 ? '...' : ''}`,
          description: tweet.text,
          fullText: tweet.text,
          image: tweet.user.profileImage,
          type: 'twitter',
          author: tweet.user.username,
          authorDisplayName: tweet.user.displayName,
          tweetId: tweet.id,
          platform: 'X',
          source: 'twitter-api',
          verified: tweet.user.verified,
          createdAt: tweet.createdAt,
          metrics: tweet.metrics,
          isRetweet: tweet.isRetweet,
          isReply: tweet.isReply,
          isQuote: tweet.isQuote,
          media: tweet.media
        };
      }
    } catch (error) {
      console.log(`🚫 TwitterAPI failed for ${url}: ${error.message}`);
    }

    // NO FALLBACK - TwitterAPI only
    console.log(`❌ TwitterAPI failed for ${url} - no fallback allowed`);
    
    return {
      url,
      title: `Twitter post by @${username} (TwitterAPI failed)`,
      description: 'TwitterAPI rate limited - waiting for next available slot',
      image: username ? `https://unavatar.io/twitter/${username}` : null,
      type: 'twitter',
      author: username,
      tweetId,
      platform: 'X',
      source: 'twitter-api-failed',
      error: 'Rate limited - TwitterAPI only mode'
    };
  }

  async tryNitterProxy(url, username, tweetId) {
    // Try using xcancel.com as a proxy
    try {
      const nitterUrl = url.replace('x.com', 'xcancel.com').replace('twitter.com', 'xcancel.com');
      const response = await this.makeRequest(nitterUrl);
      const $ = cheerio.load(response.data);
      
      const tweetText = $('.tweet-content').text().trim();
      const authorName = $('.tweet-header .fullname').text().trim();
      const tweetDate = $('.tweet-date').attr('title');
      
      if (tweetText) {
        console.log(`🕊️  Successfully got tweet via Nitter proxy: ${tweetText.substring(0, 50)}...`);
        return {
          url,
          title: `@${username}: ${tweetText.substring(0, 80)}${tweetText.length > 80 ? '...' : ''}`,
          description: tweetText,
          image: null,
          type: 'twitter',
          author: username,
          authorName,
          tweetId,
          tweetDate,
          platform: 'X',
          source: 'nitter-proxy'
        };
      }
    } catch (error) {
      console.log(`🚫 Nitter proxy failed for ${url}`);
    }
    
    return null;
  }

  async tryDirectScraping(url, username, tweetId) {
    try {
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('title').text() || 
                   `Tweet by @${username}`;
      
      const description = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="description"]').attr('content') || 
                         'Twitter/X post';
      
      const image = $('meta[property="og:image"]').attr('content');
      
      if (title && title !== 'Twitter') {
        console.log(`📱 Successfully scraped Twitter metadata: ${title}`);
        return {
          url,
          title,
          description,
          image,
          type: 'twitter',
          author: username,
          tweetId,
          platform: 'X',
          source: 'direct-scraping'
        };
      }
    } catch (error) {
      console.log(`🚫 Direct scraping failed for ${url}: ${error.message}`);
    }
    
    return null;
  }

  createEnhancedFallback(url, username, tweetId) {
    const isXDomain = url.includes('x.com');
    const platform = isXDomain ? 'X' : 'Twitter';
    
    // Extract timestamp from tweet ID (Twitter snowflake format)
    let tweetDate = null;
    if (tweetId) {
      try {
        // Twitter snowflake epoch starts at 2006-03-21
        const twitterEpoch = 1142974214000;
        const timestamp = parseInt(tweetId) >> 22;
        tweetDate = new Date(timestamp + twitterEpoch);
      } catch (error) {
        // Ignore timestamp extraction errors
      }
    }
    
    console.log(`🔄 Using enhanced fallback for ${url}`);
    
    return {
      url,
      title: username ? 
        `${platform} post by @${username}${tweetDate ? ` (${tweetDate.toLocaleDateString()})` : ''}` : 
        `${platform} post`,
      description: tweetId ? 
        `${platform} post from ${tweetDate ? tweetDate.toLocaleDateString() : 'unknown date'} - Click to view on ${platform}` : 
        `${platform} social media post - Click to view on ${platform}`,
      image: username ? `https://unavatar.io/twitter/${username}` : null, // Use Unavatar for profile pics
      type: 'twitter',
      author: username,
      tweetId,
      tweetDate: tweetDate?.toISOString(),
      platform,
      fallback: true,
      source: 'enhanced-fallback'
    };
  }

  async fetchThreadsMetadata(url) {
    console.log(`🧵 Processing Threads URL: ${url}`);

    // Check cache first
    try {
      const cachedThreads = await this.persistentCache.get(url);
      if (cachedThreads) {
        console.log(`💾 Using cached Threads data for ${url}`);
        return cachedThreads;
      }
    } catch (error) {
      console.log(`⚠️ Error checking Threads cache: ${error.message}`);
    }

    // Try ThreadsAPIService first (rich scraping)
    try {
      const threadsData = await this.threadsAPI.scrapeURL(url);
      
      if (threadsData && (threadsData.thread || threadsData.user)) {
        let metadata;
        
        if (threadsData.thread) {
          // It's a thread/post
          const thread = threadsData.thread;
          console.log(`✅ Got rich Threads post data: "${thread.text?.substring(0, 50) || 'No text'}..."`);
          
          metadata = {
            url,
            title: `@${thread.username}: ${thread.text?.substring(0, 80) || 'Threads post'}${(thread.text?.length || 0) > 80 ? '...' : ''}`,
            description: thread.text || 'Threads post',
            fullText: thread.text,
            image: thread.user_pic || (thread.images && thread.images[0]) || null,
            type: 'threads',
            author: thread.username,
            threadId: thread.id || thread.pk,
            threadCode: thread.code,
            platform: 'Threads',
            source: 'threads-api',
            verified: thread.user_verified,
            publishedOn: thread.published_on ? new Date(thread.published_on * 1000).toISOString() : null,
            metrics: {
              likes: thread.like_count || 0,
              replies: thread.reply_count || 0
            },
            hasAudio: thread.has_audio,
            media: {
              images: thread.images || [],
              videos: thread.videos || [],
              imageCount: thread.image_count || 0
            },
            replies: threadsData.replies || []
          };
        } else if (threadsData.user) {
          // It's a profile
          const user = threadsData.user;
          console.log(`✅ Got rich Threads profile data: @${user.username || 'unknown'}`);
          
          metadata = {
            url,
            title: `@${user.username} on Threads`,
            description: user.bio || `${user.full_name || user.username} on Threads`,
            fullBio: user.bio,
            image: user.profile_pic,
            type: 'threads',
            username: user.username,
            fullName: user.full_name,
            platform: 'Threads',
            source: 'threads-api',
            verified: user.is_verified,
            isPrivate: user.is_private,
            followers: user.followers,
            bioLinks: user.bio_links || [],
            recentThreads: threadsData.threads || []
          };
        }
        
        // Cache the result
        if (metadata) {
          const ttl = 6 * 60 * 60 * 1000; // 6 hours TTL for Threads content
          await this.persistentCache.set(url, metadata, ttl);
          console.log(`✅ Successfully fetched and cached Threads metadata for ${url}`);
          return metadata;
        }
      }
    } catch (error) {
      console.log(`🚫 ThreadsAPI failed for ${url}: ${error.message}`);
    }

    // Fallback to basic scraping
    try {
      console.log(`🔄 Falling back to basic scraping for ${url}`);
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      const fallbackMetadata = {
        url,
        title: $('meta[property="og:title"]').attr('content') || 'Threads Post',
        description: $('meta[property="og:description"]').attr('content') || 'Meta Threads post',
        image: $('meta[property="og:image"]').attr('content'),
        type: 'threads',
        platform: 'Threads',
        source: 'fallback-scraping'
      };
      
      // Cache fallback for shorter time
      const shortTTL = 2 * 60 * 60 * 1000; // 2 hours
      await this.persistentCache.set(url, fallbackMetadata, shortTTL);
      
      return fallbackMetadata;
    } catch (error) {
      console.log(`🚫 Fallback scraping failed for ${url}: ${error.message}`);
      
      // Final fallback
      const finalFallback = {
        url,
        title: 'Threads Post',
        description: 'Meta Threads post - rich preview unavailable',
        image: null,
        type: 'threads',
        platform: 'Threads',
        error: error.message,
        fallback: true,
        source: 'final-fallback'
      };
      
      // Cache fallback for even shorter time
      const veryShortTTL = 30 * 60 * 1000; // 30 minutes
      await this.persistentCache.set(url, finalFallback, veryShortTTL);
      
      return finalFallback;
    }
  }

  async fetchBlueskyMetadata(url) {
    console.log(`📘 Processing Bluesky URL: ${url}`);

    // Check cache first
    try {
      const cachedBluesky = await this.persistentCache.get(url);
      if (cachedBluesky) {
        console.log(`💾 Using cached Bluesky data for ${url}`);
        return cachedBluesky;
      }
    } catch (error) {
      console.log(`⚠️ Error checking Bluesky cache: ${error.message}`);
    }

    // Try BlueskyAPIService first (rich API data)
    try {
      const blueskyData = await this.blueskyAPI.fetchPostMetadata(url);
      
      if (blueskyData) {
        console.log(`✅ Got rich Bluesky post data: "${blueskyData.text?.substring(0, 50) || 'No text'}..."`);
        
        const metadata = {
          url,
          title: `@${blueskyData.author.handle}: ${blueskyData.text?.substring(0, 80) || 'Bluesky post'}${(blueskyData.text?.length || 0) > 80 ? '...' : ''}`,
          description: blueskyData.text || 'Bluesky post',
          fullText: blueskyData.text,
          image: blueskyData.author.avatar || null,
          type: 'bluesky',
          author: blueskyData.author.handle,
          authorDisplayName: blueskyData.author.displayName,
          authorDID: blueskyData.author.did,
          postId: blueskyData.id,
          postURI: blueskyData.uri,
          platform: 'Bluesky',
          source: 'bluesky-api',
          verified: blueskyData.author.verified,
          createdAt: blueskyData.createdAt,
          metrics: {
            replies: blueskyData.metrics.replyCount || 0,
            reposts: blueskyData.metrics.repostCount || 0,
            likes: blueskyData.metrics.likeCount || 0,
            quotes: blueskyData.metrics.quoteCount || 0
          },
          embed: blueskyData.embed,
          reply: blueskyData.reply,
          languages: blueskyData.langs || []
        };
        
        // Cache the result
        const ttl = 6 * 60 * 60 * 1000; // 6 hours TTL for Bluesky content
        await this.persistentCache.set(url, metadata, ttl);
        console.log(`✅ Successfully fetched and cached Bluesky metadata for ${url}`);
        return metadata;
      }
    } catch (error) {
      console.log(`🚫 BlueskyAPI failed for ${url}: ${error.message}`);
    }

    // Fallback to basic scraping (though Bluesky doesn't provide much via HTML scraping)
    try {
      console.log(`🔄 Falling back to basic scraping for ${url}`);
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      const fallbackMetadata = {
        url,
        title: $('meta[property="og:title"]').attr('content') || 'Bluesky Post',
        description: $('meta[property="og:description"]').attr('content') || 'Bluesky social media post',
        image: $('meta[property="og:image"]').attr('content'),
        type: 'bluesky',
        platform: 'Bluesky',
        source: 'fallback-scraping'
      };
      
      // Cache fallback for shorter time
      const shortTTL = 2 * 60 * 60 * 1000; // 2 hours
      await this.persistentCache.set(url, fallbackMetadata, shortTTL);
      
      return fallbackMetadata;
    } catch (error) {
      console.log(`🚫 Fallback scraping failed for ${url}: ${error.message}`);
      
      // Final fallback
      const finalFallback = {
        url,
        title: 'Bluesky Post',
        description: 'Bluesky social media post - rich preview unavailable',
        image: null,
        type: 'bluesky',
        platform: 'Bluesky',
        error: error.message,
        fallback: true,
        source: 'final-fallback'
      };
      
      // Cache fallback for even shorter time
      const veryShortTTL = 30 * 60 * 1000; // 30 minutes
      await this.persistentCache.set(url, finalFallback, veryShortTTL);
      
      return finalFallback;
    }
  }

  async fetchYouTubeMetadata(url) {
    // Extract video ID from various YouTube URL formats
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    
    try {
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      return {
        url,
        title: $('meta[property="og:title"]').attr('content') || $('title').text() || 'YouTube Video',
        description: $('meta[property="og:description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        type: 'youtube',
        videoId,
        duration: $('meta[itemprop="duration"]').attr('content'),
        platform: 'YouTube'
      };
    } catch (error) {
      return {
        url,
        title: 'YouTube Video',
        description: 'YouTube video content',
        image: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
        type: 'youtube',
        videoId,
        platform: 'YouTube'
      };
    }
  }

  async fetchGitHubMetadata(url) {
    // Extract owner and repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    const owner = match?.[1];
    const repo = match?.[2];
    
    try {
      // Try to use GitHub API if available
      if (owner && repo) {
        try {
          const apiResponse = await this.makeRequest(`https://api.github.com/repos/${owner}/${repo}`);
          
          const repoData = JSON.parse(apiResponse.data);
          
          return {
            url,
            title: `${owner}/${repo}`,
            description: repoData.description || 'GitHub repository',
            image: repoData.owner.avatar_url,
            type: 'github',
            stars: repoData.stargazers_count,
            language: repoData.language,
            platform: 'GitHub'
          };
        } catch (apiError) {
          // Fall back to scraping
          const response = await this.makeRequest(url);
          const $ = cheerio.load(response.data);
          
          return {
            url,
            title: $('meta[property="og:title"]').attr('content') || `${owner}/${repo}`,
            description: $('meta[property="og:description"]').attr('content') || 'GitHub repository',
            image: $('meta[property="og:image"]').attr('content'),
            type: 'github',
            platform: 'GitHub'
          };
        }
      }
    } catch (error) {
      return {
        url,
        title: 'GitHub Repository',
        description: 'GitHub repository or content',
        image: null,
        type: 'github',
        platform: 'GitHub'
      };
    }
  }

  async fetchGenericMetadata(url) {
    try {
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('meta[name="twitter:title"]').attr('content') ||
                   $('title').text() || 
                   this.extractDomainName(url);
      
      const description = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="twitter:description"]').attr('content') ||
                         $('meta[name="description"]').attr('content') || '';
      
      const image = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image"]').attr('content');
      
      return {
        url,
        title: title.trim(),
        description: description.trim(),
        image,
        type: this.getUrlType(url),
        platform: this.extractDomainName(url)
      };
    } catch (error) {
      throw error;
    }
  }

  async fetchLinkedInMetadata(url) {
    // LinkedIn often blocks scraping, so provide basic info
    return {
      url,
      title: 'LinkedIn Post',
      description: 'LinkedIn professional network post',
      image: null,
      type: 'linkedin',
      platform: 'LinkedIn'
    };
  }

  async fetchSpotifyMetadata(url) {
    // Extract Spotify track/episode ID
    const spotifyId = url.match(/spotify\.com\/(track|episode|show)\/([^?]+)/)?.[2];
    
    return {
      url,
      title: 'Spotify Content',
      description: 'Spotify music or podcast content',
      image: null,
      type: 'spotify',
      spotifyId,
      platform: 'Spotify'
    };
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const request = () => {
        try {
          const urlObj = new URL(url);
          const client = urlObj.protocol === 'https:' ? https : http;
          
          const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
              'User-Agent': this.userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Connection': 'keep-alive'
            },
            timeout: 10000
          };

          const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              resolve({ data, status: res.statusCode, headers: res.headers });
            });
          });

          req.on('error', (error) => {
            reject(error);
          });
          
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
          });

          req.end();
        } catch (error) {
          reject(error);
        }
      };

      this.requestQueue.push({ request, url });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    let lastDomain = null;
    
    while (this.requestQueue.length > 0) {
      const { request, url } = this.requestQueue.shift();
      
      // Get domain for rate limiting
      const domain = this.extractDomainName(url);
      const delay = this.domainDelays[domain] || this.requestDelay;
      
      // Extra delay if hitting the same domain consecutively
      const actualDelay = lastDomain === domain ? delay * 1.5 : delay;
      
      console.log(`🕐 Processing request for ${domain} (delay: ${actualDelay}ms)`);
      
      await request();
      lastDomain = domain;
      
      // Rate limiting delay between requests
      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
    
    this.isProcessing = false;
    console.log(`✅ Request queue processed (${this.requestQueue.length} remaining)`);
  }

  getUrlType(url) {
    const domain = this.extractDomainName(url).toLowerCase();
    
    if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
    if (domain.includes('threads.net')) return 'threads';
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
    if (domain.includes('github.com')) return 'github';
    if (domain.includes('linkedin.com')) return 'linkedin';
    if (domain.includes('spotify.com')) return 'spotify';
    if (domain.includes('bsky.app')) return 'bluesky';
    if (domain.includes('news.ycombinator.com')) return 'hackernews';
    if (domain.includes('reddit.com')) return 'reddit';
    
    return 'website';
  }

  extractDomainName(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  // Batch process multiple Twitter URLs for efficiency
  async batchProcessTwitterUrls(urls) {
    const twitterUrls = urls.filter(url => 
      url.includes('twitter.com') || url.includes('x.com')
    );
    
    if (twitterUrls.length === 0) {
      return [];
    }

    console.log(`🐦 Batch processing ${twitterUrls.length} Twitter URLs`);
    
    // Extract tweet IDs and check cache
    const uncachedUrls = [];
    const results = [];
    
    for (const url of twitterUrls) {
      const tweetId = url.match(/status\/(\d+)/)?.[1];
      if (tweetId) {
        // Check if already cached
        try {
          const cached = await this.persistentCache.getTwitterDataByTweetId(tweetId);
          if (cached) {
            results.push({ url, metadata: cached });
          } else {
            uncachedUrls.push(url);
          }
        } catch (error) {
          uncachedUrls.push(url);
        }
      }
    }
    
    // Batch fetch uncached tweets
    if (uncachedUrls.length > 0) {
      try {
        const tweetData = await this.twitterAPI.processTweetUrls(uncachedUrls);
        
        // Process and cache the results
        for (const tweet of tweetData) {
          await this.persistentCache.cacheTwitterAPIData(tweet, tweet.originalUrl);
          
          results.push({
            url: tweet.originalUrl,
            metadata: {
              url: tweet.originalUrl,
              title: `@${tweet.user.username}: ${tweet.text.substring(0, 80)}${tweet.text.length > 80 ? '...' : ''}`,
              description: tweet.text,
              fullText: tweet.text,
              image: tweet.user.profileImage,
              type: 'twitter',
              author: tweet.user.username,
              authorDisplayName: tweet.user.displayName,
              tweetId: tweet.id,
              platform: 'X',
              source: 'twitter-api',
              verified: tweet.user.verified,
              createdAt: tweet.createdAt,
              metrics: tweet.metrics,
              media: tweet.media
            }
          });
        }
        
        console.log(`✅ Batch processed ${tweetData.length} tweets via TwitterAPI`);
      } catch (error) {
        console.error(`❌ Batch Twitter processing failed: ${error.message}`);
        
        // Fallback to individual processing for failed URLs
        for (const url of uncachedUrls) {
          try {
            const metadata = await this.fetchTwitterMetadata(url);
            results.push({ url, metadata });
          } catch (individualError) {
            console.error(`Failed individual processing for ${url}:`, individualError.message);
          }
        }
      }
    }
    
    return results;
  }

  // Enhanced fetching with batch optimization
  async fetchMultipleMetadata(urls) {
    const twitterUrls = urls.filter(url => url.includes('twitter.com') || url.includes('x.com'));
    const otherUrls = urls.filter(url => !url.includes('twitter.com') && !url.includes('x.com'));
    
    const results = [];
    
    // Batch process Twitter URLs
    if (twitterUrls.length > 0) {
      const twitterResults = await this.batchProcessTwitterUrls(twitterUrls);
      results.push(...twitterResults);
    }
    
    // Process other URLs individually
    for (const url of otherUrls) {
      try {
        const metadata = await this.fetchMetadata(url);
        results.push({ url, metadata });
      } catch (error) {
        console.error(`Failed to fetch metadata for ${url}:`, error.message);
      }
    }
    
    return results;
  }

  // Get Twitter API usage statistics
  async getTwitterAPIStats() {
    try {
      return await this.twitterAPI.getUsageStats();
    } catch (error) {
      console.log('Twitter API stats not available');
      return null;
    }
  }

  // Clear cache periodically to prevent memory issues
  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Cleanup method for proper shutdown
  async cleanup() {
    try {
      if (this.threadsAPI) {
        await this.threadsAPI.closeBrowser();
      }
      // Bluesky API doesn't require special cleanup currently
      if (this.persistentCache) {
        // Close persistent cache if it has cleanup methods
        if (typeof this.persistentCache.close === 'function') {
          await this.persistentCache.close();
        }
      }
      console.log('✅ MetadataFetcher cleaned up successfully');
    } catch (error) {
      console.error('Error during MetadataFetcher cleanup:', error);
    }
  }
}

module.exports = { MetadataFetcher };