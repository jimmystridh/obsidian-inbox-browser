class ContentClassifier {
  constructor() {
    this.workDomains = new Set([
      'github.com', 'gitlab.com', 'stackoverflow.com', 'linkedin.com',
      'azure.microsoft.com', 'aws.amazon.com', 'cloud.google.com',
      'docs.microsoft.com', 'developer.mozilla.org', 'techcrunch.com',
      'hacker-news.firebaseio.com', 'news.ycombinator.com', 'dev.to',
      'medium.com', 'towards-data-science', 'freecodecamp.org'
    ]);
    
    this.personalDomains = new Set([
      'youtube.com', 'youtu.be', 'spotify.com', 'instagram.com',
      'tiktok.com', 'pinterest.com', 'reddit.com/r/cooking',
      'reddit.com/r/fitness', 'reddit.com/r/parenting', 'imdb.com',
      'netflix.com', 'amazon.com/gp', 'booking.com', 'airbnb.com'
    ]);
    
    this.workKeywords = new Set([
      // Tech/Programming
      'api', 'github', 'programming', 'development', 'coding', 'software',
      'javascript', 'python', 'react', 'node', 'database', 'deployment',
      'docker', 'kubernetes', 'aws', 'azure', 'cloud', 'devops',
      'terraform', 'infrastructure', 'monitoring', 'microservices',
      'authentication', 'security', 'performance', 'optimization',
      'framework', 'library', 'tool', 'cli', 'automation', 'ci/cd',
      
      // Business/Professional
      'project', 'management', 'team', 'meeting', 'presentation',
      'client', 'customer', 'business', 'strategy', 'planning',
      'productivity', 'workflow', 'process', 'agile', 'scrum',
      'analytics', 'metrics', 'dashboard', 'reporting', 'data',
      
      // AI/ML (context-dependent)
      'llm', 'openai', 'chatgpt', 'claude', 'anthropic', 'machine learning',
      'artificial intelligence', 'neural network', 'transformer',
      'embedding', 'vector', 'rag', 'fine-tuning'
    ]);
    
    this.personalKeywords = new Set([
      // Swedish personal terms
      'träning', 'hemträning', 'glasögon', 'barnkläder', 'tavlor', 
      'mysig', 'vardagsrum', 'garderob', 'rensa', 'organisera',
      'elpiano', 'basketboll', 'radiostyrd', 'båt', 'fyller',
      
      // Family & Personal
      'family', 'baby', 'children', 'kids', 'home', 'house', 'garden',
      'cooking', 'recipe', 'fitness', 'exercise', 'health', 'hobby',
      'vacation', 'travel', 'movie', 'music', 'game', 'sport',
      'shopping', 'buy', 'purchase', 'gift', 'birthday', 'celebration',
      
      // Entertainment
      'youtube video', 'funny', 'entertainment', 'joke', 'meme',
      'netflix', 'spotify', 'podcast', 'audiobook', 'book review'
    ]);
    
    this.workTwitterAccounts = new Set([
      'github', 'microsoft', 'googledevelopers', 'awscloud', 'docker',
      'kubernetesio', 'nodejs', 'reactjs', 'vuejs', 'angular',
      'typeorm', 'prisma', 'nestframework', 'fastify', 'expressjs',
      'vercel', 'netlify', 'cloudflare', 'digitalocean', 'heroku',
      'simonw', 'gdb', 'kentcdodds', 'dan_abramov', 'sebmck',
      'addyosmani', 'paul_irish', 'chriscoyier', 'smashingmag',
      'techcrunch', 'producthunt', 'ycombinator'
    ]);
    
    this.personalTwitterAccounts = new Set([
      'netflix', 'spotify', 'youtube', 'instagram', 'pinterest',
      'buzzfeed', 'tasty', 'foodnetwork', 'travel', 'lonelyplanet',
      'bbcearth', 'natgeo', 'discovery', 'history'
    ]);
  }

  classifyContent(item) {
    const classification = {
      category: 'unclear', // work, personal, mixed, unclear
      confidence: 0, // 0-1
      reasons: [],
      suggestedTags: [],
      context: {}
    };

    // Domain-based classification
    const domainScore = this.classifyByDomain(item);
    classification.confidence += domainScore.confidence * 0.3;
    classification.reasons.push(...domainScore.reasons);

    // Keyword-based classification  
    const keywordScore = this.classifyByKeywords(item);
    classification.confidence += keywordScore.confidence * 0.3;
    classification.reasons.push(...keywordScore.reasons);

    // Social account classification
    const socialScore = this.classifyBySocialAccounts(item);
    classification.confidence += socialScore.confidence * 0.2;
    classification.reasons.push(...socialScore.reasons);

    // Content analysis
    const contentScore = this.classifyByContent(item);
    classification.confidence += contentScore.confidence * 0.2;
    classification.reasons.push(...contentScore.reasons);

    // Determine final category
    if (classification.confidence > 0.7) {
      classification.category = domainScore.category || keywordScore.category || 'unclear';
    } else if (classification.confidence > 0.4) {
      classification.category = 'mixed';
    } else {
      classification.category = 'unclear';
    }

    // Generate suggested tags
    classification.suggestedTags = this.generateTags(item, classification);

    console.log(`🏷️  Classified "${item.content.substring(0, 50)}..." as ${classification.category} (confidence: ${classification.confidence.toFixed(2)})`);

    return classification;
  }

  classifyByDomain(item) {
    const result = { category: null, confidence: 0, reasons: [] };

    for (const url of item.urls) {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        
        if (this.workDomains.has(domain) || domain.includes('docs.') || domain.includes('api.')) {
          result.category = 'work';
          result.confidence = Math.max(result.confidence, 0.8);
          result.reasons.push(`Work domain: ${domain}`);
        } else if (this.personalDomains.has(domain)) {
          result.category = 'personal';
          result.confidence = Math.max(result.confidence, 0.8);
          result.reasons.push(`Personal domain: ${domain}`);
        }
        
        // Special cases
        if (domain.includes('github.com') && url.includes('/issues') || url.includes('/pull')) {
          result.confidence = Math.max(result.confidence, 0.9);
          result.reasons.push('GitHub issue/PR - likely work');
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }

    return result;
  }

  classifyByKeywords(item) {
    const result = { category: null, confidence: 0, reasons: [] };
    const content = item.content.toLowerCase();
    
    let workScore = 0;
    let personalScore = 0;
    
    // Count work keywords
    for (const keyword of this.workKeywords) {
      if (content.includes(keyword.toLowerCase())) {
        workScore += keyword.length > 5 ? 2 : 1; // Longer keywords get more weight
        result.reasons.push(`Work keyword: "${keyword}"`);
      }
    }
    
    // Count personal keywords
    for (const keyword of this.personalKeywords) {
      if (content.includes(keyword.toLowerCase())) {
        personalScore += keyword.length > 5 ? 2 : 1;
        result.reasons.push(`Personal keyword: "${keyword}"`);
      }
    }
    
    // Determine classification
    const totalScore = workScore + personalScore;
    if (totalScore > 0) {
      if (workScore > personalScore * 1.5) {
        result.category = 'work';
        result.confidence = Math.min(workScore / (workScore + personalScore), 0.9);
      } else if (personalScore > workScore * 1.5) {
        result.category = 'personal';
        result.confidence = Math.min(personalScore / (workScore + personalScore), 0.9);
      } else {
        result.category = 'mixed';
        result.confidence = 0.5;
      }
    }

    return result;
  }

  classifyBySocialAccounts(item) {
    const result = { category: null, confidence: 0, reasons: [] };

    for (const url of item.urls) {
      if (url.includes('x.com/') || url.includes('twitter.com/')) {
        const username = url.match(/(?:x\.com|twitter\.com)\/([^/]+)/)?.[1];
        if (username) {
          if (this.workTwitterAccounts.has(username.toLowerCase())) {
            result.category = 'work';
            result.confidence = Math.max(result.confidence, 0.7);
            result.reasons.push(`Work Twitter account: @${username}`);
          } else if (this.personalTwitterAccounts.has(username.toLowerCase())) {
            result.category = 'personal';  
            result.confidence = Math.max(result.confidence, 0.7);
            result.reasons.push(`Personal Twitter account: @${username}`);
          }
        }
      }
    }

    return result;
  }

  classifyByContent(item) {
    const result = { category: null, confidence: 0, reasons: [] };
    const content = item.content.toLowerCase();

    // Time-based hints
    if (item.timestamp) {
      const hour = new Date(item.timestamp.replace(' ', 'T')).getHours();
      if (hour >= 9 && hour <= 17) {
        result.reasons.push('Added during work hours');
        // Slight bias toward work during work hours
        if (result.category === null) {
          result.confidence += 0.1;
        }
      } else {
        result.reasons.push('Added during personal time');
        // Slight bias toward personal during off hours  
        if (result.category === null) {
          result.confidence += 0.1;
        }
      }
    }

    // Language detection for Swedish personal content
    const swedishPersonalTerms = ['träning', 'hemma', 'barn', 'familj', 'mysig'];
    const swedishWorkTerms = ['jobb', 'arbete', 'projekt', 'möte'];
    
    let swedishPersonal = 0;
    let swedishWork = 0;
    
    for (const term of swedishPersonalTerms) {
      if (content.includes(term)) swedishPersonal++;
    }
    
    for (const term of swedishWorkTerms) {
      if (content.includes(term)) swedishWork++;
    }
    
    if (swedishPersonal > swedishWork) {
      result.category = 'personal';
      result.confidence = Math.max(result.confidence, 0.6);
      result.reasons.push('Swedish personal content detected');
    } else if (swedishWork > 0) {
      result.category = 'work';
      result.confidence = Math.max(result.confidence, 0.6);
      result.reasons.push('Swedish work content detected');
    }

    return result;
  }

  generateTags(item, classification) {
    const tags = [];
    
    // Primary classification tag
    tags.push(`#${classification.category}`);
    
    // Content type tags
    tags.push(`#${item.type}`);
    
    // Specific tags based on content
    const content = item.content.toLowerCase();
    
    if (content.includes('ai') || content.includes('llm') || content.includes('chatgpt')) {
      tags.push('#ai');
    }
    
    if (content.includes('github.com')) {
      tags.push('#code');
    }
    
    if (content.includes('youtube.com') && content.includes('tutorial')) {
      tags.push('#learning');
    }
    
    if (item.timestamp) {
      const date = new Date(item.timestamp.replace(' ', 'T'));
      tags.push(`#${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
    
    // Swedish content
    if (this.isSwedishContent(content)) {
      tags.push('#svenska');
    }
    
    return tags;
  }

  isSwedishContent(content) {
    const swedishWords = [
      'och', 'att', 'det', 'är', 'för', 'med', 'till', 'av', 'som', 'har',
      'träning', 'hemma', 'barnkläder', 'sälja', 'rensa', 'organisera',
      'glasögon', 'läroplan', 'ekonomi', 'mysig', 'vardagsrum'
    ];
    
    const words = content.toLowerCase().split(/\s+/);
    const swedishWordCount = words.filter(word => swedishWords.includes(word)).length;
    
    return swedishWordCount >= 2; // Need at least 2 Swedish words
  }

  // Learn from user corrections
  learnFromFeedback(item, userClassification, originalClassification) {
    console.log(`🧠 Learning: User classified "${item.content.substring(0, 30)}..." as ${userClassification} (was ${originalClassification.category})`);
    
    // In a real implementation, this would update ML model weights
    // For now, we'll just log the learning opportunity
    
    // Extract patterns from user correction
    if (userClassification === 'work' && originalClassification.category === 'personal') {
      this.extractWorkPatterns(item);
    } else if (userClassification === 'personal' && originalClassification.category === 'work') {
      this.extractPersonalPatterns(item);
    }
  }

  extractWorkPatterns(item) {
    // Extract domains, keywords, and accounts that user considers work-related
    for (const url of item.urls) {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        if (!this.workDomains.has(domain)) {
          console.log(`🔍 New work domain identified: ${domain}`);
          // In production, add to dynamic learning set
        }
      } catch (error) {
        // Skip invalid URLs
      }
    }
  }

  extractPersonalPatterns(item) {
    // Extract domains, keywords, and accounts that user considers personal
    for (const url of item.urls) {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        if (!this.personalDomains.has(domain)) {
          console.log(`🏠 New personal domain identified: ${domain}`);
          // In production, add to dynamic learning set
        }
      } catch (error) {
        // Skip invalid URLs
      }
    }
  }

  // Get classification statistics
  getClassificationStats(items) {
    const stats = {
      work: 0,
      personal: 0,
      mixed: 0,
      unclear: 0,
      confidence: {
        high: 0, // > 0.7
        medium: 0, // 0.4-0.7
        low: 0 // < 0.4
      }
    };

    items.forEach(item => {
      const classification = this.classifyContent(item);
      stats[classification.category]++;
      
      if (classification.confidence > 0.7) {
        stats.confidence.high++;
      } else if (classification.confidence > 0.4) {
        stats.confidence.medium++;
      } else {
        stats.confidence.low++;
      }
    });

    return stats;
  }

  // Suggest bulk operations for similar content
  suggestBulkClassification(items) {
    const suggestions = [];
    
    // Group by domain
    const domainGroups = {};
    items.forEach(item => {
      item.urls.forEach(url => {
        try {
          const domain = new URL(url).hostname;
          if (!domainGroups[domain]) domainGroups[domain] = [];
          domainGroups[domain].push(item);
        } catch (error) {
          // Skip invalid URLs
        }
      });
    });
    
    // Suggest bulk operations for domains with multiple items
    Object.entries(domainGroups).forEach(([domain, domainItems]) => {
      if (domainItems.length >= 3) {
        const classification = this.workDomains.has(domain) ? 'work' : 
                            this.personalDomains.has(domain) ? 'personal' : null;
        
        if (classification) {
          suggestions.push({
            type: 'domain-bulk',
            domain,
            classification,
            items: domainItems,
            count: domainItems.length,
            description: `Classify all ${domainItems.length} items from ${domain} as ${classification}`
          });
        }
      }
    });

    return suggestions;
  }
}

module.exports = { ContentClassifier };