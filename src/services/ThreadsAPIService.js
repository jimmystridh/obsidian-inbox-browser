const { chromium } = require('playwright');
const jmespath = require('jmespath');

class ThreadsAPIService {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestDelay = 2000; // 2 seconds between requests
    this.maxRetries = 3;
    this.lastRequestTime = 0;
    this.browser = null;
    this.context = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }

  parseThread(data) {
    try {
      const result = jmespath.search(`{
        text: post.caption.text,
        published_on: post.taken_at,
        id: post.id,
        pk: post.pk,
        code: post.code,
        username: post.user.username,
        user_pic: post.user.profile_pic_url,
        user_verified: post.user.is_verified,
        user_pk: post.user.pk,
        user_id: post.user.id,
        has_audio: post.has_audio,
        reply_count: post.text_post_app_info.direct_reply_count,
        like_count: post.like_count,
        images: post.carousel_media[].image_versions2.candidates[1].url,
        image_count: post.carousel_media_count,
        videos: post.video_versions[].url
      }`, data);

      // Clean up videos array
      if (result.videos) {
        result.videos = [...new Set(result.videos.filter(v => v))];
      }

      // Parse reply count if it's a string
      if (result.reply_count && typeof result.reply_count !== 'number') {
        const match = result.reply_count.toString().match(/\\d+/);
        result.reply_count = match ? parseInt(match[0]) : 0;
      }

      // Generate URL
      if (result.username && result.code) {
        result.url = `https://www.threads.net/@${result.username}/post/${result.code}`;
      }

      return result;
    } catch (error) {
      console.error('Error parsing thread data:', error);
      return null;
    }
  }

  parseProfile(data) {
    try {
      const result = jmespath.search(`{
        is_private: text_post_app_is_private,
        is_verified: is_verified,
        profile_pic: hd_profile_pic_versions[-1].url,
        username: username,
        full_name: full_name,
        bio: biography,
        bio_links: bio_links[].url,
        followers: follower_count
      }`, data);

      if (result.username) {
        result.url = `https://www.threads.net/@${result.username}`;
      }

      return result;
    } catch (error) {
      console.error('Error parsing profile data:', error);
      return null;
    }
  }

  // Utility function to find nested keys (JavaScript version of nested_lookup)
  nestedLookup(key, obj, results = []) {
    if (typeof obj !== 'object' || obj === null) {
      return results;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.nestedLookup(key, item, results);
      }
    } else {
      for (const [k, v] of Object.entries(obj)) {
        if (k === key) {
          results.push(v);
        }
        this.nestedLookup(key, v, results);
      }
    }

    return results;
  }

  async scrapeThread(url, retryCount = 0) {
    console.log(`🧵 Scraping Threads post: ${url}`);

    try {
      await this.initBrowser();
      const page = await this.context.newPage();

      // Navigate to URL and wait for page to load
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait for the main content to load
      await page.waitForSelector('[data-pressable-container="true"]', { timeout: 10000 });

      // Get page content
      const content = await page.content();
      await page.close();

      // Parse the content with Cheerio-like approach
      const scriptRegex = /<script type="application\/json"[^>]*data-sjs[^>]*>(.*?)<\/script>/gs;
      const scripts = [];
      let match;
      
      while ((match = scriptRegex.exec(content)) !== null) {
        scripts.push(match[1]);
      }

      // Find datasets that contain threads data
      for (const hiddenDataset of scripts) {
        // Skip datasets that clearly don't contain threads data
        if (!hiddenDataset.includes('"ScheduledServerJS"') || !hiddenDataset.includes('thread_items')) {
          continue;
        }

        try {
          const data = JSON.parse(hiddenDataset);
          
          // Find thread_items using nested lookup
          const threadItems = this.nestedLookup('thread_items', data);
          
          if (threadItems.length === 0) {
            continue;
          }

          // Parse threads using jmespath
          const threads = [];
          for (const threadGroup of threadItems) {
            if (Array.isArray(threadGroup)) {
              for (const thread of threadGroup) {
                const parsedThread = this.parseThread(thread);
                if (parsedThread) {
                  threads.push(parsedThread);
                }
              }
            }
          }

          if (threads.length > 0) {
            console.log(`✅ Successfully scraped ${threads.length} threads from ${url}`);
            return {
              thread: threads[0], // Main post
              replies: threads.slice(1) // Replies
            };
          }

        } catch (parseError) {
          console.error('Error parsing JSON dataset:', parseError);
          continue;
        }
      }

      throw new Error('Could not find thread data in page');

    } catch (error) {
      console.error(`❌ Failed to scrape thread: ${error.message}`);
      
      if (retryCount < this.maxRetries) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.requestDelay * (retryCount + 1)));
        return this.scrapeThread(url, retryCount + 1);
      }

      throw error;
    }
  }

  async scrapeProfile(url, retryCount = 0) {
    console.log(`👤 Scraping Threads profile: ${url}`);

    try {
      await this.initBrowser();
      const page = await this.context.newPage();

      // Navigate to URL and wait for page to load
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait for the main content to load
      await page.waitForSelector('[data-pressable-container="true"]', { timeout: 10000 });

      // Get page content
      const content = await page.content();
      await page.close();

      const parsed = {
        user: {},
        threads: []
      };

      // Parse the content for hidden datasets
      const scriptRegex = /<script type="application\/json"[^>]*data-sjs[^>]*>(.*?)<\/script>/gs;
      const scripts = [];
      let match;
      
      while ((match = scriptRegex.exec(content)) !== null) {
        scripts.push(match[1]);
      }

      // Find datasets that contain profile or threads data
      for (const hiddenDataset of scripts) {
        // Skip datasets that clearly don't contain relevant data
        if (!hiddenDataset.includes('"ScheduledServerJS"')) {
          continue;
        }

        const isProfile = hiddenDataset.includes('follower_count');
        const isThreads = hiddenDataset.includes('thread_items');
        
        if (!isProfile && !isThreads) {
          continue;
        }

        try {
          const data = JSON.parse(hiddenDataset);

          if (isProfile) {
            // Find user data using nested lookup
            const userData = this.nestedLookup('user', data);
            if (userData.length > 0) {
              const parsedProfile = this.parseProfile(userData[0]);
              if (parsedProfile) {
                parsed.user = parsedProfile;
              }
            }
          }

          if (isThreads) {
            // Find thread items using nested lookup
            const threadItems = this.nestedLookup('thread_items', data);
            
            for (const threadGroup of threadItems) {
              if (Array.isArray(threadGroup)) {
                for (const thread of threadGroup) {
                  const parsedThread = this.parseThread(thread);
                  if (parsedThread) {
                    parsed.threads.push(parsedThread);
                  }
                }
              }
            }
          }

        } catch (parseError) {
          console.error('Error parsing JSON dataset:', parseError);
          continue;
        }
      }

      if (Object.keys(parsed.user).length === 0 && parsed.threads.length === 0) {
        throw new Error('Could not find profile data in page');
      }

      console.log(`✅ Successfully scraped profile: ${parsed.user.username || 'unknown'} with ${parsed.threads.length} threads`);
      return parsed;

    } catch (error) {
      console.error(`❌ Failed to scrape profile: ${error.message}`);
      
      if (retryCount < this.maxRetries) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.requestDelay * (retryCount + 1)));
        return this.scrapeProfile(url, retryCount + 1);
      }

      throw error;
    }
  }

  // Helper method to determine URL type
  getURLType(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== 'www.threads.net' && urlObj.hostname !== 'threads.net') {
        return null;
      }

      const pathParts = urlObj.pathname.split('/').filter(p => p);
      
      // Profile URL: /@username or /@username/
      if (pathParts.length === 1 && pathParts[0].startsWith('@')) {
        return 'profile';
      }
      
      // Post URL: /@username/post/code or /t/code
      if (pathParts.length === 3 && pathParts[0].startsWith('@') && pathParts[1] === 'post') {
        return 'thread';
      }
      
      if (pathParts.length === 2 && pathParts[0] === 't') {
        return 'thread';
      }

      return 'profile'; // Default to profile for ambiguous cases
    } catch (error) {
      return null;
    }
  }

  async scrapeURL(url) {
    const urlType = this.getURLType(url);
    
    if (!urlType) {
      throw new Error('Invalid Threads URL');
    }

    // Enforce rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();

    try {
      if (urlType === 'thread') {
        return await this.scrapeThread(url);
      } else {
        return await this.scrapeProfile(url);
      }
    } finally {
      // Don't close browser immediately, keep it for potential reuse
      // Will be closed when service is destroyed
    }
  }
}

module.exports = { ThreadsAPIService };