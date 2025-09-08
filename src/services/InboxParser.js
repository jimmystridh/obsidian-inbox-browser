class InboxParser {
  constructor() {
    // Updated regex to handle markdown links [text](url) and parentheses in URLs
    this.urlPattern = /https?:\/\/[^\s\]]+(?:\([^)]*\)[^\s\]]*)*[^\s\],.)]/g;
    this.markdownLinkPattern = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
    this.timestampPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
  }

  parseInboxContent(content) {
    const lines = content.split('\n');
    const items = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.startsWith('#') || line.startsWith('Type:') || line.startsWith('Links:')) {
        continue;
      }

      const item = this.parseLine(line, i);
      if (item) {
        items.push(item);
      }
    }

    return items.reverse(); // Most recent first
  }

  parseLine(line, index) {
    // Check if line starts with a timestamp
    const timestampMatch = line.match(this.timestampPattern);
    if (!timestampMatch) {
      // Handle lines without timestamps (just content)
      if (line.trim()) {
        return {
          id: `item-${index}`,
          timestamp: null,
          content: line,
          rawLine: line,
          urls: this.extractUrls(line),
          type: this.determineContentType(line),
          lineNumber: index + 1
        };
      }
      return null;
    }

    const timestamp = timestampMatch[0];
    const content = line.substring(timestamp.length).trim();
    
    if (!content) return null;

    const urls = this.extractUrls(content);
    const type = this.determineContentType(content, urls);

    return {
      id: `item-${timestamp}-${index}`,
      timestamp,
      content,
      rawLine: line,
      urls,
      type,
      lineNumber: index + 1,
      date: new Date(timestamp.replace(' ', 'T') + ':00')
    };
  }

  extractUrls(content) {
    const urls = [];
    
    // First extract URLs from markdown links [text](url)
    const markdownMatches = content.matchAll(this.markdownLinkPattern);
    for (const match of markdownMatches) {
      urls.push(match[2]); // The URL is in the second capture group
      console.log(`📝 Extracted markdown URL: ${match[2]}`);
    }
    
    // Then extract plain URLs that aren't already captured in markdown links
    const remainingContent = content.replace(this.markdownLinkPattern, '');
    const plainMatches = remainingContent.match(this.urlPattern);
    if (plainMatches) {
      const cleanUrls = plainMatches.map(url => url.replace(/[)\],.]+$/, ''));
      urls.push(...cleanUrls);
      cleanUrls.forEach(url => console.log(`🔗 Extracted plain URL: ${url}`));
    }
    
    // Remove duplicates and return
    const uniqueUrls = [...new Set(urls)];
    if (uniqueUrls.length > 0) {
      console.log(`✅ Total URLs found: ${uniqueUrls.length} from content: "${content.substring(0, 100)}..."`);
    }
    return uniqueUrls;
  }

  determineContentType(content, urls = []) {
    const lowerContent = content.toLowerCase();
    
    // Check URLs first
    for (const url of urls) {
      const domain = this.extractDomain(url);
      
      if (domain.includes('twitter.com') || domain.includes('x.com')) {
        console.log(`🐦 Identified Twitter/X URL: ${url} (domain: ${domain})`);
        return 'twitter';
      }
      if (domain.includes('threads.net')) {
        return 'threads';
      }
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        return 'youtube';
      }
      if (domain.includes('github.com')) {
        return 'github';
      }
      if (domain.includes('linkedin.com')) {
        return 'linkedin';
      }
      if (domain.includes('spotify.com')) {
        return 'spotify';
      }
      if (domain.includes('bsky.app')) {
        return 'bluesky';
      }
      if (domain.includes('news.ycombinator.com')) {
        return 'hackernews';
      }
      if (domain.includes('reddit.com')) {
        return 'reddit';
      }
    }

    // Check content for keywords
    if (lowerContent.includes('http')) {
      return 'link';
    }
    
    // Swedish content detection
    if (this.isSwedishContent(content)) {
      return 'swedish-note';
    }

    return 'note';
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  isSwedishContent(content) {
    const swedishWords = [
      'och', 'att', 'det', 'är', 'för', 'med', 'till', 'av', 'som', 'har',
      'träning', 'hemma', 'barnkläder', 'sälja', 'rensa', 'organisera',
      'glasögon', 'läroplan', 'ekonomi'
    ];
    
    const words = content.toLowerCase().split(/\s+/);
    const swedishWordCount = words.filter(word => swedishWords.includes(word)).length;
    
    return swedishWordCount > 0;
  }

  categorizeItems(items) {
    const categories = {
      twitter: [],
      threads: [],
      youtube: [],
      github: [],
      articles: [],
      personal: [],
      swedish: [],
      other: []
    };

    items.forEach(item => {
      switch (item.type) {
        case 'twitter':
          categories.twitter.push(item);
          break;
        case 'threads':
          categories.threads.push(item);
          break;
        case 'youtube':
          categories.youtube.push(item);
          break;
        case 'github':
          categories.github.push(item);
          break;
        case 'link':
          categories.articles.push(item);
          break;
        case 'swedish-note':
          categories.swedish.push(item);
          break;
        case 'note':
          categories.personal.push(item);
          break;
        default:
          categories.other.push(item);
      }
    });

    return categories;
  }

  getItemStats(items) {
    const stats = {
      total: items.length,
      byType: {},
      byMonth: {},
      urlCount: 0,
      noteCount: 0
    };

    items.forEach(item => {
      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      
      // Count by month
      if (item.timestamp) {
        const month = item.timestamp.substring(0, 7); // YYYY-MM
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      }
      
      // Count URLs vs notes
      if (item.urls.length > 0) {
        stats.urlCount++;
      } else {
        stats.noteCount++;
      }
    });

    return stats;
  }
}

module.exports = { InboxParser };