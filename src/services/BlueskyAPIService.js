const { BskyAgent } = require('@atproto/api');
const fs = require('fs').promises;
const path = require('path');

class BlueskyAPIService {
  constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social'
    });
    this.authenticated = false;
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestDelay = 1000; // 1 second between requests
    this.maxRetries = 3;
    this.lastRequestTime = 0;
    this.rateLimitResetTime = 0;
    
    // Load credentials from environment or config
    this.loadCredentials();
  }

  async loadCredentials() {
    try {
      // Try to load from .env file
      const envPath = path.join(process.cwd(), '.env');
      const envContent = await fs.readFile(envPath, 'utf-8');
      const lines = envContent.split('\n');
      
      let identifier, password;
      for (const line of lines) {
        if (line.startsWith('BSKY_IDENTIFIER=')) {
          identifier = line.split('=')[1].replace(/"/g, '').replace('@', '');
        }
        if (line.startsWith('BSKY_APP_PASSWORD=')) {
          password = line.split('=')[1].replace(/"/g, '');
        }
      }

      if (identifier && password) {
        this.credentials = { identifier, password };
        console.log('📘 Bluesky credentials loaded from .env file');
      } else {
        console.log('⚠️  Bluesky credentials not found in .env file');
      }
    } catch (error) {
      console.log('📘 No .env file found, Bluesky API will work in read-only mode');
    }
  }

  async authenticate() {
    if (this.authenticated) {
      return true;
    }

    if (!this.credentials) {
      console.log('📘 No Bluesky credentials available, using public endpoints only');
      return false;
    }

    try {
      await this.agent.login({
        identifier: this.credentials.identifier,
        password: this.credentials.password
      });
      
      this.authenticated = true;
      console.log('✅ Successfully authenticated with Bluesky API');
      return true;
    } catch (error) {
      console.error('❌ Failed to authenticate with Bluesky:', error.message);
      return false;
    }
  }

  // Extract post URI from Bluesky URL
  extractPostURI(url) {
    try {
      const urlObj = new URL(url);
      
      // Handle different Bluesky URL formats:
      // https://bsky.app/profile/user.bsky.social/post/3kb2uqblah4z5
      // https://staging.bsky.app/profile/user.bsky.social/post/3kb2uqblah4z5
      
      if (!urlObj.hostname.includes('bsky.app')) {
        return null;
      }

      const pathParts = urlObj.pathname.split('/').filter(p => p);
      
      if (pathParts.length >= 4 && pathParts[0] === 'profile' && pathParts[2] === 'post') {
        const handle = pathParts[1];
        const postId = pathParts[3];
        
        // Convert to AT-URI format
        // We need to resolve the handle to a DID, but for now we'll construct a likely URI
        // In practice, this might need DID resolution
        return {
          url,
          handle,
          postId,
          // This is a simplified approach - real implementation might need DID resolution
          uri: `at://${handle}/app.bsky.feed.post/${postId}`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing Bluesky URL:', error);
      return null;
    }
  }

  async getPostsByURIs(uris, retryCount = 0) {
    if (!Array.isArray(uris)) {
      uris = [uris];
    }

    console.log(`📘 Fetching ${uris.length} Bluesky posts`);

    try {
      // Attempt to authenticate (will use public endpoints if no credentials)
      await this.authenticate();

      // Enforce rate limiting
      await this.enforceRateLimit();

      const response = await this.agent.api.app.bsky.feed.getPosts({ uris });
      
      if (response.success && response.data && response.data.posts) {
        console.log(`✅ Successfully fetched ${response.data.posts.length} posts from Bluesky`);
        return response.data.posts.map(post => this.formatPost(post));
      }

      throw new Error('Invalid response from Bluesky API');

    } catch (error) {
      console.error(`❌ Failed to fetch Bluesky posts: ${error.message}`);
      
      if (retryCount < this.maxRetries) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.requestDelay * (retryCount + 1)));
        return this.getPostsByURIs(uris, retryCount + 1);
      }

      throw error;
    }
  }

  formatPost(post) {
    return {
      id: post.cid,
      uri: post.uri,
      text: post.record.text || '',
      createdAt: post.record.createdAt,
      author: {
        did: post.author.did,
        handle: post.author.handle,
        displayName: post.author.displayName || post.author.handle,
        avatar: post.author.avatar,
        verified: post.author.verified || false
      },
      metrics: {
        replyCount: post.replyCount || 0,
        repostCount: post.repostCount || 0,
        likeCount: post.likeCount || 0,
        quoteCount: post.quoteCount || 0
      },
      embed: post.embed || null,
      reply: post.record.reply || null,
      langs: post.record.langs || [],
      originalUrl: post.originalUrl // Will be set by the calling code
    };
  }

  async resolveHandleToDID(handle) {
    try {
      const response = await this.agent.api.com.atproto.identity.resolveHandle({ handle });
      if (response.success && response.data.did) {
        return response.data.did;
      }
    } catch (error) {
      console.error(`Failed to resolve handle ${handle}:`, error.message);
    }
    return null;
  }

  async fetchPostMetadata(url) {
    try {
      const postInfo = this.extractPostURI(url);
      if (!postInfo) {
        throw new Error('Invalid Bluesky URL format');
      }

      // Try to resolve handle to DID for more accurate URI
      const did = await this.resolveHandleToDID(postInfo.handle);
      let uri = postInfo.uri;
      
      if (did) {
        uri = `at://${did}/app.bsky.feed.post/${postInfo.postId}`;
      }

      const posts = await this.getPostsByURIs([uri]);
      
      if (posts && posts.length > 0) {
        const post = posts[0];
        post.originalUrl = url; // Add original URL for reference
        return post;
      }

      throw new Error('Post not found');
      
    } catch (error) {
      console.error(`Failed to fetch Bluesky post metadata for ${url}:`, error.message);
      throw error;
    }
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Helper method to check if URL is a Bluesky URL
  isBlueskyURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('bsky.app');
    } catch {
      return false;
    }
  }

  // Get usage statistics
  getUsageStats() {
    return {
      authenticated: this.authenticated,
      service: 'bsky.social',
      lastRequestTime: this.lastRequestTime,
      requestDelay: this.requestDelay
    };
  }
}

module.exports = { BlueskyAPIService };