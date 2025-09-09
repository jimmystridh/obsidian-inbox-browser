const path = require('path');

class NoteTemplateService {
  constructor(obsidianPath) {
    this.obsidianPath = obsidianPath;
    
    // Define content type to category mappings
    this.categoryMappings = {
      'youtube': 'ToWatch',
      'twitter': 'Insights',
      'bluesky': 'Insights', 
      'threads': 'Insights',
      'github': 'Resources',
      'website': 'ToRead',
      'hackernews': 'ToRead',
      'linkedin': 'Insights',
      'spotify': 'ToWatch'
    };
    
    // Define templates for each category
    this.templates = {
      ToRead: this.createToReadTemplate,
      ToWatch: this.createToWatchTemplate,
      Resources: this.createResourceTemplate,
      Insights: this.createInsightTemplate
    };
  }

  // Suggest category based on metadata
  suggestCategory(metadata) {
    const type = metadata.type?.toLowerCase();
    return this.categoryMappings[type] || 'Resources';
  }

  // Generate filename from metadata
  generateFilename(metadata, category, userContext = {}) {
    const date = new Date().toISOString().split('T')[0];
    let name;
    
    switch (category) {
      case 'ToRead':
        name = this.sanitizeFilename(metadata.title || 'Article');
        break;
      case 'ToWatch':
        name = this.sanitizeFilename(metadata.title || 'Video');
        break;
      case 'Resources':
        if (metadata.type === 'github') {
          name = metadata.title?.replace('/', '-') || 'GitHub Tool';
        } else {
          name = this.sanitizeFilename(metadata.title || 'Resource');
        }
        break;
      case 'Insights':
        const author = metadata.author || 'Unknown';
        const topic = this.extractTopic(metadata.description || metadata.title);
        name = `${author} - ${topic}`;
        break;
      default:
        name = this.sanitizeFilename(metadata.title || 'Note');
    }
    
    return `${date} - ${name}.md`;
  }

  // Create file path for the note using existing vault structure
  getNotePath(category, filename) {
    // Use existing vault structure with "99 Archive" for processed items
    let categoryPath;
    
    switch (category) {
      case 'ToRead':
        categoryPath = path.join(this.obsidianPath, 'ToRead');
        break;
      case 'ToWatch': 
        categoryPath = path.join(this.obsidianPath, 'ToWatch');
        break;
      case 'Resources':
        categoryPath = path.join(this.obsidianPath, 'Resources');
        break;
      case 'Insights':
        categoryPath = path.join(this.obsidianPath, 'Insights');
        break;
      case 'Archive':
        categoryPath = path.join(this.obsidianPath, '99 Archive');
        break;
      default:
        categoryPath = path.join(this.obsidianPath, category);
    }
    
    return {
      categoryPath,
      fullPath: path.join(categoryPath, filename)
    };
  }

  // Template for articles and reading material
  createToReadTemplate(metadata, userContext = {}) {
    const frontMatter = this.createFrontMatter(metadata, userContext, 'to-read');
    
    return `---
${frontMatter}
---

# ${metadata.title}

**Author**: ${metadata.author || 'Unknown'} | **Platform**: ${metadata.platform} | **Date**: ${this.formatDate(metadata.createdAt)}
**Source**: [${metadata.platform}](${metadata.url})

## Summary
${metadata.description || 'No description available'}

${userContext.notes ? `## Why Interesting\n${userContext.notes}\n` : '## Why Interesting\n[Add your thoughts here]\n'}

${userContext.priority ? `**Priority**: ${userContext.priority}\n` : ''}

## Reading Notes
[Add notes while reading]

## Key Takeaways
[Main insights and learnings]

## Related
${userContext.tags ? userContext.tags.map(tag => `[[${tag}]]`).join(' ') : '[Link related notes here]'}

---
*Created: ${new Date().toISOString().split('T')[0]} via Inbox Browser*`;
  }

  // Template for videos and watchable content  
  createToWatchTemplate(metadata, userContext = {}) {
    const frontMatter = this.createFrontMatter(metadata, userContext, 'to-watch');
    
    return `---
${frontMatter}
---

# ${metadata.title}

**Channel**: ${metadata.author || 'Unknown'} | **Duration**: ${metadata.duration || 'Unknown'} | **Date**: ${this.formatDate(metadata.createdAt)}
**Source**: [${metadata.platform}](${metadata.url})

![thumbnail](${metadata.image || ''})

## Description
${metadata.description || 'No description available'}

${userContext.notes ? `## Why Watch\n${userContext.notes}\n` : '## Why Watch\n[Why is this worth watching?]\n'}

${userContext.priority ? `**Priority**: ${userContext.priority}\n` : ''}

## Key Takeaways
[Notes while watching]

## Action Items
[Things to try or follow up on]

## Related
${userContext.tags ? userContext.tags.map(tag => `[[${tag}]]`).join(' ') : '[Link related notes here]'}

---
*Created: ${new Date().toISOString().split('T')[0]} via Inbox Browser*`;
  }

  // Template for tools, GitHub repos, and technical resources
  createResourceTemplate(metadata, userContext = {}) {
    const frontMatter = this.createFrontMatter(metadata, userContext, 'resource');
    
    let template = `---
${frontMatter}
---

# ${metadata.title}

**Source**: [${metadata.platform}](${metadata.url})`;

    // Add type-specific information
    if (metadata.type === 'github') {
      template += `
**Author**: ${metadata.author || 'Unknown'} | **Language**: ${metadata.language || 'Unknown'} | **Stars**: ${metadata.stars || 0}

## Description
${metadata.description || 'No description available'}

## Use Case
${userContext.notes || '[How could this be useful?]'}

## Implementation Notes
[Setup instructions, usage examples, etc.]`;
    } else {
      template += `
**Platform**: ${metadata.platform} | **Date**: ${this.formatDate(metadata.createdAt)}

## Description  
${metadata.description || 'No description available'}

## Use Case
${userContext.notes || '[How is this resource useful?]'}

## Notes
[Implementation details, key points, etc.]`;
    }

    template += `

${userContext.priority ? `**Priority**: ${userContext.priority}\n` : ''}

## Related
${userContext.tags ? userContext.tags.map(tag => `[[${tag}]]`).join(' ') : '[Link related notes here]'}

---
*Created: ${new Date().toISOString().split('T')[0]} via Inbox Browser*`;

    return template;
  }

  // Template for social media insights
  createInsightTemplate(metadata, userContext = {}) {
    const frontMatter = this.createFrontMatter(metadata, userContext, 'insight');
    
    return `---
${frontMatter}
---

# ${metadata.authorDisplayName || metadata.author} - ${this.extractTopic(metadata.description || metadata.title)}

**Author**: [@${metadata.author}](${metadata.url}) | **Platform**: ${metadata.platform} | **Date**: ${this.formatDate(metadata.createdAt)}
${metadata.verified ? '✅ **Verified Account**' : ''}

${metadata.metrics ? `**Engagement**: ${metadata.metrics.likes || 0} likes, ${metadata.metrics.retweets || metadata.metrics.reposts || 0} shares, ${metadata.metrics.replies || 0} replies` : ''}

## Content
> ${metadata.fullText || metadata.description || 'No content available'}

${userContext.notes ? `## Key Insight\n${userContext.notes}\n` : '## Key Insight\n[What is the main takeaway?]\n'}

## Follow-up
[Action items or related thoughts]

${userContext.priority ? `**Priority**: ${userContext.priority}\n` : ''}

## Related  
${userContext.tags ? userContext.tags.map(tag => `[[${tag}]]`).join(' ') : '[Link related notes here]'}

---
*Created: ${new Date().toISOString().split('T')[0]} via Inbox Browser*`;
  }

  // Create YAML frontmatter
  createFrontMatter(metadata, userContext, category) {
    const date = new Date().toISOString().split('T')[0];
    
    return `title: "${this.escapeFrontMatter(metadata.title || 'Untitled')}"
created: ${date}
source: "${metadata.url}"
platform: "${metadata.platform}"
type: "${metadata.type}"
category: "${category}"
author: "${metadata.author || 'Unknown'}"
${userContext.tags ? `tags:\n${userContext.tags.map(tag => `  - ${tag}`).join('\n')}` : 'tags: []'}
${userContext.priority ? `priority: "${userContext.priority}"` : 'priority: "medium"'}
status: "inbox"`;
  }

  // Generate complete note
  generateNote(metadata, category, userContext = {}) {
    const templateFunction = this.templates[category];
    if (!templateFunction) {
      throw new Error(`Unknown note category: ${category}`);
    }
    
    return templateFunction.call(this, metadata, userContext);
  }

  // Utility functions
  sanitizeFilename(name) {
    return name
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  escapeFrontMatter(text) {
    return text.replace(/"/g, '\\"');
  }

  formatDate(dateString) {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  extractTopic(text) {
    if (!text) return 'General';
    
    // Extract first meaningful words as topic
    const words = text.split(' ').slice(0, 5).join(' ');
    return this.sanitizeFilename(words).substring(0, 30);
  }

  // Get all available categories
  getAvailableCategories() {
    return [
      { key: 'ToRead', label: 'To Read', description: 'Articles, blog posts, documentation' },
      { key: 'ToWatch', label: 'To Watch', description: 'Videos, tutorials, presentations' },
      { key: 'Resources', label: 'Resources', description: 'Tools, GitHub repos, references' },
      { key: 'Insights', label: 'Insights', description: 'Social posts, quotes, ideas' }
    ];
  }
}

module.exports = { NoteTemplateService };