const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class PersistentCache {
  constructor(cachePath = './cache', defaultTtl = 24 * 60 * 60 * 1000) { // 24 hours default TTL
    this.cachePath = cachePath;
    this.defaultTtl = defaultTtl;
    this.dbPath = path.join(cachePath, 'metadata-cache.db');
    this.isReady = false;
    
    this.initialize();
  }

  async initialize() {
    try {
      // Ensure cache directory exists
      if (!fs.existsSync(this.cachePath)) {
        fs.mkdirSync(this.cachePath, { recursive: true });
      }

      // Initialize SQLite database
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          return;
        }
        // Connected to SQLite metadata cache
      });

      // Create cache table with TTL support
      await this.createTable();
      
      // Note: Automatic expiration disabled per user request
      
      this.isReady = true;
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  createTable() {
    return new Promise((resolve, reject) => {
      // First create the basic table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS metadata_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT UNIQUE NOT NULL,
          metadata TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL,
          hits INTEGER DEFAULT 0,
          last_accessed INTEGER
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Add new columns if they don't exist (for schema migration)
        this.migrateSchema(() => {
          // Create indexes after migration
          this.createIndexes(resolve, reject);
        });
      });
    });
  }

  migrateSchema(callback) {
    // Add new columns one by one, ignoring errors if they already exist
    const newColumns = [
      'ALTER TABLE metadata_cache ADD COLUMN content_type TEXT DEFAULT "generic"',
      'ALTER TABLE metadata_cache ADD COLUMN tweet_id TEXT',
      'ALTER TABLE metadata_cache ADD COLUMN twitter_username TEXT',
      'ALTER TABLE metadata_cache ADD COLUMN full_text TEXT',
      'ALTER TABLE metadata_cache ADD COLUMN api_source TEXT DEFAULT "scraping"'
    ];

    let completed = 0;
    const total = newColumns.length;

    newColumns.forEach(sql => {
      this.db.run(sql, (err) => {
        // Ignore "duplicate column" errors
        if (err && !err.message.includes('duplicate column')) {
          console.log(`Schema migration note: ${err.message}`);
        }
        
        completed++;
        if (completed === total) {
          // Schema migration completed
          callback();
        }
      });
    });
  }

  createIndexes(resolve, reject) {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_url ON metadata_cache(url)',
      'CREATE INDEX IF NOT EXISTS idx_tweet_id ON metadata_cache(tweet_id)',
      'CREATE INDEX IF NOT EXISTS idx_twitter_username ON metadata_cache(twitter_username)',
      'CREATE INDEX IF NOT EXISTS idx_content_type ON metadata_cache(content_type)',
      'CREATE INDEX IF NOT EXISTS idx_api_source ON metadata_cache(api_source)'
    ];

    let completed = 0;
    const total = indexes.length;

    indexes.forEach(sql => {
      this.db.run(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          console.log('✅ Database indexes created');
          resolve();
        }
      });
    });
  }

  async get(url) {
    if (!this.isReady) {
      console.log('⏳ Cache not ready, skipping...');
      return null;
    }

    return new Promise((resolve, reject) => {
      const now = Date.now();
      const query = `
        SELECT metadata, expires_at, hits 
        FROM metadata_cache 
        WHERE url = ? AND expires_at > ?
      `;

      this.db.get(query, [url, now], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row) {
          // Update hit count and last accessed time
          this.updateHitCount(url);
          
          // Cache hit
          resolve(JSON.parse(row.metadata));
        } else {
          resolve(null);
        }
      });
    });
  }

  async set(url, metadata, ttl = null) {
    if (!this.isReady) {
      console.log('⏳ Cache not ready, skipping set...');
      return false;
    }

    const now = Date.now();
    const expireTime = now + (ttl || this.defaultTtl);
    const metadataJSON = JSON.stringify(metadata);

    // Extract Twitter-specific fields for indexing
    const contentType = metadata.type || 'generic';
    const tweetId = metadata.tweetId || null;
    const twitterUsername = metadata.author || null;
    const fullText = metadata.fullText || metadata.description || null;
    const apiSource = metadata.source || 'scraping';

    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO metadata_cache 
        (url, metadata, created_at, expires_at, hits, last_accessed, content_type, tweet_id, twitter_username, full_text, api_source)
        VALUES (?, ?, ?, ?, COALESCE((SELECT hits FROM metadata_cache WHERE url = ?), 0), ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        url, metadataJSON, now, expireTime, url, now, 
        contentType, tweetId, twitterUsername, fullText, apiSource
      ], function(err) {
        if (err) {
          console.error('Error caching metadata:', err);
          reject(err);
        } else {
          // Cached metadata
          resolve(true);
        }
      });
    });
  }

  updateHitCount(url) {
    if (!this.isReady) return;

    const now = Date.now();
    const query = `
      UPDATE metadata_cache 
      SET hits = hits + 1, last_accessed = ?
      WHERE url = ?
    `;

    this.db.run(query, [now, url], (err) => {
      if (err) {
        console.error('Error updating hit count:', err);
      }
    });
  }

  async cleanExpired() {
    if (!this.isReady) return;

    return new Promise((resolve, reject) => {
      const now = Date.now();
      const query = 'DELETE FROM metadata_cache WHERE expires_at < ?';

      this.db.run(query, [now], function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            console.log(`🧹 Cleaned ${this.changes} expired cache entries`);
          }
          resolve(this.changes);
        }
      });
    });
  }

  async getCacheStats() {
    if (!this.isReady) return null;

    return new Promise((resolve, reject) => {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM metadata_cache',
        expired: 'SELECT COUNT(*) as count FROM metadata_cache WHERE expires_at < ?',
        byType: `
          SELECT 
            JSON_EXTRACT(metadata, '$.type') as type,
            COUNT(*) as count,
            AVG(hits) as avg_hits
          FROM metadata_cache 
          WHERE expires_at > ?
          GROUP BY JSON_EXTRACT(metadata, '$.type')
          ORDER BY count DESC
        `,
        topUrls: `
          SELECT url, hits, last_accessed
          FROM metadata_cache 
          WHERE expires_at > ?
          ORDER BY hits DESC 
          LIMIT 10
        `
      };

      const now = Date.now();
      const stats = {};

      // Get total count
      this.db.get(queries.total, [], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        stats.total = row.count;

        // Get expired count
        this.db.get(queries.expired, [now], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          stats.expired = row.count;
          stats.active = stats.total - stats.expired;

          // Get breakdown by type
          this.db.all(queries.byType, [now], (err, rows) => {
            if (err) {
              reject(err);
              return;
            }
            stats.byType = rows;

            // Get top URLs
            this.db.all(queries.topUrls, [now], (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              stats.topUrls = rows;
              resolve(stats);
            });
          });
        });
      });
    });
  }

  // Get cache entries by type for debugging
  async getEntriesByType(type, limit = 10) {
    if (!this.isReady) return [];

    return new Promise((resolve, reject) => {
      const query = `
        SELECT url, metadata, created_at, hits
        FROM metadata_cache 
        WHERE JSON_EXTRACT(metadata, '$.type') = ? AND expires_at > ?
        ORDER BY last_accessed DESC
        LIMIT ?
      `;

      const now = Date.now();
      this.db.all(query, [type, now, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            url: row.url,
            metadata: JSON.parse(row.metadata),
            createdAt: new Date(row.created_at),
            hits: row.hits
          })));
        }
      });
    });
  }

  // Set different TTL for different content types
  getTTLForType(type) {
    const ttlConfig = {
      twitter: 6 * 60 * 60 * 1000,     // 6 hours (longer since API costs credits)
      'twitter-api': 24 * 60 * 60 * 1000, // 24 hours for TwitterAPI.io data
      threads: 2 * 60 * 60 * 1000,     // 2 hours (social media content)
      youtube: 7 * 24 * 60 * 60 * 1000, // 7 days (video content rarely changes)
      github: 24 * 60 * 60 * 1000,     // 24 hours (repository data)
      website: 12 * 60 * 60 * 1000,    // 12 hours (general websites)
      hackernews: 6 * 60 * 60 * 1000,  // 6 hours (news content)
      linkedin: 4 * 60 * 60 * 1000,    // 4 hours (professional content)
      spotify: 7 * 24 * 60 * 60 * 1000 // 7 days (music/podcast content)
    };

    return ttlConfig[type] || this.defaultTtl;
  }

  // Twitter-specific cache methods
  async getTwitterDataByTweetId(tweetId) {
    if (!this.isReady) return null;

    return new Promise((resolve, reject) => {
      const now = Date.now();
      const query = `
        SELECT metadata, url, full_text, api_source
        FROM metadata_cache 
        WHERE tweet_id = ? AND expires_at > ? AND content_type = 'twitter'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      this.db.get(query, [tweetId, now], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          console.log(`🐦 Found cached Twitter data for tweet ID: ${tweetId} (source: ${row.api_source})`);
          resolve(JSON.parse(row.metadata));
        } else {
          resolve(null);
        }
      });
    });
  }

  async cacheTwitterAPIData(tweetData, originalUrl) {
    const metadata = {
      url: originalUrl,
      title: `@${tweetData.user.username}: ${tweetData.text.substring(0, 80)}${tweetData.text.length > 80 ? '...' : ''}`,
      description: tweetData.text,
      fullText: tweetData.text,
      type: 'twitter',
      author: tweetData.user.username,
      authorDisplayName: tweetData.user.displayName,
      tweetId: tweetData.id,
      image: tweetData.user.profileImage,
      platform: 'X',
      source: 'twitter-api',
      verified: tweetData.user.verified,
      createdAt: tweetData.createdAt,
      metrics: tweetData.metrics,
      isRetweet: tweetData.isRetweet,
      isReply: tweetData.isReply,
      isQuote: tweetData.isQuote,
      media: tweetData.media,
      entities: tweetData.entities
    };

    // Use longer TTL for TwitterAPI data
    const ttl = this.getTTLForType('twitter-api');
    return await this.set(originalUrl, metadata, ttl);
  }

  async close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('📦 SQLite cache database closed');
        }
      });
    }
  }

  // Scheduled cleanup - call this periodically
  async scheduledCleanup() {
    try {
      const cleaned = await this.cleanExpired();
      const stats = await this.getCacheStats();
      
      console.log(`🧹 Cache cleanup completed:`, {
        cleaned,
        active: stats.active,
        total: stats.total
      });
      
      return stats;
    } catch (error) {
      console.error('Error during scheduled cleanup:', error);
    }
  }
}

module.exports = { PersistentCache };