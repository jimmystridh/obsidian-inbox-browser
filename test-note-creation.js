const { NoteTemplateService } = require('./src/services/NoteTemplateService');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');
const fs = require('fs').promises;
const path = require('path');

async function testNoteCreation() {
  console.log('📝 Testing note creation system...');

  const OBSIDIAN_PATH = path.join(
    process.env.HOME,
    'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK'
  );

  const noteService = new NoteTemplateService(OBSIDIAN_PATH);
  const metadataFetcher = new MetadataFetcher();

  // Test different types of content with real metadata
  const testItems = [
    {
      url: 'https://github.com/anthropics/claude-code',
      expectedCategory: 'Resources',
      userContext: {
        notes: 'Official Claude Code CLI - very useful for development',
        priority: 'high',
        tags: ['development', 'claude', 'tools']
      }
    },
    {
      url: 'https://x.com/petergyang/status/1964335305659732290?s=12&t=tBkZCXBywtXBic7ilhQmmA',
      expectedCategory: 'Insights', 
      userContext: {
        notes: 'Interesting perspective on Claude Life operating system',
        priority: 'medium',
        tags: ['ai', 'productivity', 'claude']
      }
    },
    {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      expectedCategory: 'ToWatch',
      userContext: {
        notes: 'Classic video for reference',
        priority: 'low',
        tags: ['reference', 'classic']
      }
    }
  ];

  for (const testItem of testItems) {
    try {
      console.log(`\\n🧪 Testing: ${testItem.url}`);
      console.log(`📂 Expected category: ${testItem.expectedCategory}`);

      // Get metadata first
      console.log('📡 Fetching metadata...');
      const metadata = await metadataFetcher.fetchMetadata(testItem.url);
      console.log(`✅ Metadata: ${metadata.title?.substring(0, 50)}...`);
      console.log(`🏷️  Type: ${metadata.type} | Platform: ${metadata.platform}`);

      // Test category suggestion
      const suggestedCategory = noteService.suggestCategory(metadata);
      console.log(`💡 Suggested category: ${suggestedCategory}`);

      // Generate filename
      const filename = noteService.generateFilename(metadata, testItem.expectedCategory, testItem.userContext);
      console.log(`📄 Generated filename: ${filename}`);

      // Generate note content
      console.log('📝 Generating note content...');
      const noteContent = noteService.generateNote(metadata, testItem.expectedCategory, testItem.userContext);
      console.log(`✅ Note generated (${noteContent.length} characters)`);

      // Test file path generation
      const { categoryPath, fullPath } = noteService.getNotePath(testItem.expectedCategory, filename);
      console.log(`📁 Target path: ${fullPath}`);

      // Preview first 300 characters
      console.log('📋 Note preview:');
      console.log('---');
      console.log(noteContent.substring(0, 300) + '...');
      console.log('---');

      // Don't actually create files in test mode
      console.log('✅ Test completed successfully');

    } catch (error) {
      console.error(`❌ Test failed for ${testItem.url}:`, error.message);
    }
  }

  console.log('\\n=== Testing Category Mapping ===');
  const categories = noteService.getAvailableCategories();
  console.log('Available categories:', categories.map(c => `${c.key}: ${c.description}`));

  console.log('\\n🎉 Note creation testing completed!');
  console.log('\\nTo actually create notes, use the web interface or:');
  console.log('curl -X POST http://localhost:6112/api/create-note -H "Content-Type: application/json" -d \'{"url": "YOUR_URL", "category": "ToRead", "userContext": {"notes": "test"}}\'');

  await metadataFetcher.cleanup();
}

if (require.main === module) {
  testNoteCreation().catch(console.error);
}

module.exports = { testNoteCreation };