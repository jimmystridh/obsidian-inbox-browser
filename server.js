const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const chokidar = require('chokidar');
const { InboxParser } = require('./src/services/InboxParser');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');
const { NoteTemplateService } = require('./src/services/NoteTemplateService');

const app = express();
const port = 6112;

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Serve static files from build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Path to Obsidian inbox
const OBSIDIAN_PATH = path.join(
  process.env.HOME,
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK'
);
const INBOX_PATH = path.join(OBSIDIAN_PATH, 'Inbox.md');

// Initialize services
const inboxParser = new InboxParser();
const metadataFetcher = new MetadataFetcher();
const noteTemplateService = new NoteTemplateService(OBSIDIAN_PATH);

// WebSocket-like functionality using Server-Sent Events
let sseClients = [];

app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Watch inbox file for changes
const fileWatcher = chokidar.watch(INBOX_PATH, {
  persistent: true,
  ignoreInitial: false
});

fileWatcher.on('change', () => {
  // Notify all connected clients
  sseClients.forEach(client => {
    client.write(`data: ${JSON.stringify({ type: 'inbox-changed' })}\\n\\n`);
  });
});

// API Routes
app.get('/api/inbox', async (req, res) => {
  try {
    const content = await fs.readFile(INBOX_PATH, 'utf-8');
    const items = inboxParser.parseInboxContent(content);
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error loading inbox:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    const metadata = await metadataFetcher.fetchMetadata(url);
    res.json({ success: true, metadata });
  } catch (error) {
    console.error('❌ API: Error fetching metadata:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/process-item', async (req, res) => {
  try {
    const { action, item, context } = req.body;
    const result = await processInboxItem(action, item, context);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error processing item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Note creation endpoints
app.post('/api/create-note', async (req, res) => {
  try {
    const { url, category, userContext } = req.body;
    
    console.log(`📝 Creating note for: ${url} (category: ${category})`);
    
    // Get metadata for the URL
    const metadata = await metadataFetcher.fetchMetadata(url);
    
    // Generate note content
    const noteContent = noteTemplateService.generateNote(metadata, category, userContext);
    const filename = noteTemplateService.generateFilename(metadata, category, userContext);
    const { categoryPath, fullPath } = noteTemplateService.getNotePath(category, filename);
    
    // Ensure directory exists
    await ensureDirectoryExists(categoryPath);
    
    // Write the note file
    await fs.writeFile(fullPath, noteContent, 'utf-8');
    
    console.log(`✅ Created note: ${filename} in ${category}/`);
    
    res.json({ 
      success: true, 
      notePath: fullPath,
      filename,
      category
    });
  } catch (error) {
    console.error('❌ Error creating note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/preview-note', async (req, res) => {
  try {
    const { url, category, userContext } = req.body;
    
    // Get metadata for the URL
    const metadata = await metadataFetcher.fetchMetadata(url);
    
    // Generate note content for preview
    const noteContent = noteTemplateService.generateNote(metadata, category, userContext);
    const filename = noteTemplateService.generateFilename(metadata, category, userContext);
    
    res.json({ 
      success: true, 
      noteContent,
      filename,
      category,
      metadata
    });
  } catch (error) {
    console.error('❌ Error generating note preview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/note-categories', async (req, res) => {
  try {
    const categories = noteTemplateService.getAvailableCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ Error getting note categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/test-twitter/:tweetId', async (req, res) => {
  try {
    const { tweetId } = req.params;
    console.log(`🧪 Testing TwitterAPI with tweet ID: ${tweetId}`);
    
    const tweets = await metadataFetcher.twitterAPI.getTweetsByIds([tweetId]);
    
    res.json({ 
      success: true, 
      tweets,
      message: `Fetched ${tweets.length} tweets` 
    });
  } catch (error) {
    console.error('TwitterAPI test failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced item processing functions with work/personal separation
async function processInboxItem(action, item, context = {}) {

  switch (action) {
    case 'read-later':
      await moveToReadingList(item);
      break;
    case 'read-later-work':
      await moveToWorkReadingList(item);
      break;
    case 'read-later-personal':
      await moveToPersonalReadingList(item);
      break;
    case 'archive':
      await archiveItem(item);
      break;
    case 'archive-work':
      await archiveWorkItem(item);
      break;
    case 'archive-personal':
      await archivePersonalItem(item);
      break;
    case 'schedule':
      await scheduleItem(item);
      break;
    case 'schedule-work':
      await scheduleWorkItem(item);
      break;
    case 'schedule-personal':
      await schedulePersonalItem(item);
      break;
    case 'extract':
      await extractInsights(item);
      break;
    case 'delete':
      await removeFromInbox(item);
      break;
    case 'create-note':
      await createNoteFromItem(item, context);
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return `Item ${action}d successfully`;
}

async function moveToReadingList(item) {
  const readingListPath = path.join(OBSIDIAN_PATH, 'Reading List.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(readingListPath, 'utf-8');
    } catch (error) {
      content = '# Reading List\\n\\n';
    }
    
    const newEntry = `${item.timestamp} ${item.content}\\n`;
    content += newEntry;
    
    await fs.writeFile(readingListPath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to move to reading list: ${error.message}`);
  }
}

async function archiveItem(item) {
  const archivePath = path.join(OBSIDIAN_PATH, 'Archive.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(archivePath, 'utf-8');
    } catch (error) {
      content = '# Archive\\n\\n';
    }
    
    const newEntry = `${item.timestamp} ${item.content}\\n`;
    content += newEntry;
    
    await fs.writeFile(archivePath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to archive item: ${error.message}`);
  }
}

async function scheduleItem(item) {
  const schedulePath = path.join(OBSIDIAN_PATH, 'Scheduled.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(schedulePath, 'utf-8');
    } catch (error) {
      content = '# Scheduled Items\\n\\n';
    }
    
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 7);
    const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
    
    const newEntry = `${scheduleDateStr} ${item.content}\\n`;
    content += newEntry;
    
    await fs.writeFile(schedulePath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to schedule item: ${error.message}`);
  }
}

async function extractInsights(item) {
  const insightsPath = path.join(OBSIDIAN_PATH, 'Insights.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(insightsPath, 'utf-8');
    } catch (error) {
      content = '# Insights\\n\\n';
    }
    
    const newEntry = `## From ${item.timestamp}\\n${item.content}\\n\\n**Key Insights:**\\n- [Add your insights here]\\n\\n---\\n\\n`;
    content += newEntry;
    
    await fs.writeFile(insightsPath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to extract insights: ${error.message}`);
  }
}

async function removeFromInbox(item) {
  try {
    let content = await fs.readFile(INBOX_PATH, 'utf-8');
    console.log(`📖 Original inbox has ${content.length} characters`);
    
    const lines = content.split('\n'); // Use \n not \\n
    console.log(`📄 Split into ${lines.length} lines`);
    
    const exactItemLine = `${item.timestamp} ${item.content}`;
    console.log(`🎯 Looking for exact line: "${exactItemLine}"`);
    
    // Find matching lines for debugging
    const matchingLines = lines.filter(line => line.trim() === exactItemLine.trim());
    console.log(`🔍 Found ${matchingLines.length} exact matches`);
    
    // Use exact line matching to prevent accidental deletions
    const filteredLines = lines.filter(line => line.trim() !== exactItemLine.trim());
    
    console.log(`📊 Original: ${lines.length} lines, After filter: ${filteredLines.length} lines`);
    
    // SAFETY CHECK: Don't write if we'd remove too many lines
    const removedCount = lines.length - filteredLines.length;
    if (removedCount > 5) {
      throw new Error(`SAFETY: Refusing to remove ${removedCount} lines - seems dangerous`);
    }
    
    const newContent = filteredLines.join('\n'); // Use \n not \\n
    console.log(`💾 Writing ${newContent.length} characters back to inbox`);
    
    await fs.writeFile(INBOX_PATH, newContent, 'utf-8');
    console.log(`✅ Successfully removed ${removedCount} lines from inbox`);
  } catch (error) {
    console.error(`❌ CRITICAL: removeFromInbox failed:`, error.message);
    throw new Error(`Failed to remove from inbox: ${error.message}`);
  }
}

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`🚀 Inbox Browser server running on http://localhost:${port}`);
  console.log(`📂 Watching inbox at: ${INBOX_PATH}`);
});

// Work-specific processing functions
async function moveToWorkReadingList(item) {
  const workPath = path.join(OBSIDIAN_PATH, 'Work');
  await ensureDirectoryExists(workPath);
  
  const readingListPath = path.join(workPath, 'Reading List.md');
  await addToFile(readingListPath, item, '# Work Reading List\\n\\n');
  await removeFromInbox(item);
}

async function archiveWorkItem(item) {
  const workPath = path.join(OBSIDIAN_PATH, 'Work');
  await ensureDirectoryExists(workPath);
  
  const archivePath = path.join(workPath, 'Archive.md');
  await addToFile(archivePath, item, '# Work Archive\\n\\n');
  await removeFromInbox(item);
}

async function scheduleWorkItem(item) {
  const workPath = path.join(OBSIDIAN_PATH, 'Work');
  await ensureDirectoryExists(workPath);
  
  const schedulePath = path.join(workPath, 'Scheduled.md');
  const scheduleDate = getNextWorkday();
  const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
  
  await addToFile(schedulePath, item, '# Work Scheduled Items\\n\\n', scheduleDateStr);
  await removeFromInbox(item);
}

// Personal-specific processing functions  
async function moveToPersonalReadingList(item) {
  const personalPath = path.join(OBSIDIAN_PATH, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const readingListPath = path.join(personalPath, 'Reading List.md');
  await addToFile(readingListPath, item, '# Personal Reading List\\n\\n');
  await removeFromInbox(item);
}

async function archivePersonalItem(item) {
  const personalPath = path.join(OBSIDIAN_PATH, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const archivePath = path.join(personalPath, 'Archive.md');
  await addToFile(archivePath, item, '# Personal Archive\\n\\n');
  await removeFromInbox(item);
}

async function schedulePersonalItem(item) {
  const personalPath = path.join(OBSIDIAN_PATH, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const schedulePath = path.join(personalPath, 'Scheduled.md');
  const scheduleDate = getNextPersonalTime();
  const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
  
  await addToFile(schedulePath, item, '# Personal Scheduled Items\\n\\n', scheduleDateStr);
  await removeFromInbox(item);
}


// Utility functions
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function addToFile(filePath, item, header, customDate = null) {
  try {
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      content = header;
    }
    
    const timestamp = customDate || item.timestamp;
    const newEntry = `${timestamp} ${item.content}`;
    
    content += newEntry + '\\n';
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to add to file ${filePath}: ${error.message}`);
  }
}

function getNextWorkday() {
  const date = new Date();
  const day = date.getDay();
  
  if (day === 5) { // Friday
    date.setDate(date.getDate() + 3);
  } else if (day === 6) { // Saturday
    date.setDate(date.getDate() + 2);
  } else if (day === 0) { // Sunday
    date.setDate(date.getDate() + 1);
  } else {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
}

function getNextPersonalTime() {
  const date = new Date();
  const day = date.getDay();
  
  if (day >= 1 && day <= 5) {
    const daysUntilSaturday = 6 - day;
    date.setDate(date.getDate() + daysUntilSaturday);
  } else {
    date.setDate(date.getDate() + 7);
  }
  
  return date;
}

// Note creation function
async function createNoteFromItem(item, context) {
  try {
    const url = item.urls[0]; // Use first URL for metadata
    if (!url) {
      throw new Error('No URL found in item for note creation');
    }
    
    const { category = 'Resources', userContext = {} } = context;
    
    console.log(`📝 Creating note from inbox item: ${url}`);
    
    // Get rich metadata
    const metadata = await metadataFetcher.fetchMetadata(url);
    
    // Generate note content
    const noteContent = noteTemplateService.generateNote(metadata, category, userContext);
    const filename = noteTemplateService.generateFilename(metadata, category, userContext);
    const { categoryPath, fullPath } = noteTemplateService.getNotePath(category, filename);
    
    // Ensure directory exists
    await ensureDirectoryExists(categoryPath);
    
    // Write the note file
    await fs.writeFile(fullPath, noteContent, 'utf-8');
    
    // Remove from inbox after successful note creation
    await removeFromInbox(item);
    
    console.log(`✅ Created note and removed from inbox: ${filename}`);
    
    return {
      notePath: fullPath,
      filename,
      category
    };
  } catch (error) {
    console.error('❌ Failed to create note from item:', error);
    throw error;
  }
}

process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down server...');
  fileWatcher.close();
  process.exit(0);
});