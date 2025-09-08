const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const chokidar = require('chokidar');
const { InboxParser } = require('./src/services/InboxParser');
const { MetadataFetcher } = require('./src/services/MetadataFetcher');
const { ContentClassifier } = require('./src/services/ContentClassifier');

const app = express();
const port = 6112;

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Serve static files from build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Initialize services
const inboxParser = new InboxParser();
const metadataFetcher = new MetadataFetcher();
const contentClassifier = new ContentClassifier();

// Path to Obsidian inbox
const OBSIDIAN_PATH = path.join(
  process.env.HOME,
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK'
);
const INBOX_PATH = path.join(OBSIDIAN_PATH, 'Inbox.md');

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
    console.error('Error fetching metadata:', error);
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

app.post('/api/classify-item', async (req, res) => {
  try {
    const { item } = req.body;
    const classification = contentClassifier.classifyContent(item);
    res.json({ success: true, classification });
  } catch (error) {
    console.error('Error classifying item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/classification-stats', async (req, res) => {
  try {
    const content = await fs.readFile(INBOX_PATH, 'utf-8');
    const items = inboxParser.parseInboxContent(content);
    const stats = contentClassifier.getClassificationStats(items);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting classification stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/bulk-classify', async (req, res) => {
  try {
    const { items } = req.body;
    const suggestions = contentClassifier.suggestBulkClassification(items);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error getting bulk classification suggestions:', error);
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
  // Classify content if not already classified
  let classification = context.classification;
  if (!classification) {
    classification = contentClassifier.classifyContent(item);
  }

  // Add classification info to item for processing
  const enhancedItem = { ...item, classification };

  switch (action) {
    case 'read-later':
      await moveToReadingList(enhancedItem);
      break;
    case 'read-later-work':
      await moveToWorkReadingList(enhancedItem);
      break;
    case 'read-later-personal':
      await moveToPersonalReadingList(enhancedItem);
      break;
    case 'archive':
      await archiveItem(enhancedItem);
      break;
    case 'archive-work':
      await archiveWorkItem(enhancedItem);
      break;
    case 'archive-personal':
      await archivePersonalItem(enhancedItem);
      break;
    case 'schedule':
      await scheduleItem(enhancedItem);
      break;
    case 'schedule-work':
      await scheduleWorkItem(enhancedItem);
      break;
    case 'schedule-personal':
      await schedulePersonalItem(enhancedItem);
      break;
    case 'extract':
      await extractInsights(enhancedItem);
      break;
    case 'classify-work':
      await classifyAsWork(enhancedItem);
      break;
    case 'classify-personal':
      await classifyAsPersonal(enhancedItem);
      break;
    case 'delete':
      await removeFromInbox(enhancedItem);
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
    const lines = content.split('\\n');
    
    const itemLine = `${item.timestamp} ${item.content}`;
    const filteredLines = lines.filter(line => !line.includes(itemLine));
    
    await fs.writeFile(INBOX_PATH, filteredLines.join('\\n'), 'utf-8');
  } catch (error) {
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
  await addToFile(readingListPath, item, '# Work Reading List\\n\\n', true);
  await removeFromInbox(item);
}

async function archiveWorkItem(item) {
  const workPath = path.join(OBSIDIAN_PATH, 'Work');
  await ensureDirectoryExists(workPath);
  
  const archivePath = path.join(workPath, 'Archive.md');
  await addToFile(archivePath, item, '# Work Archive\\n\\n', true);
  await removeFromInbox(item);
}

async function scheduleWorkItem(item) {
  const workPath = path.join(OBSIDIAN_PATH, 'Work');
  await ensureDirectoryExists(workPath);
  
  const schedulePath = path.join(workPath, 'Scheduled.md');
  const scheduleDate = getNextWorkday();
  const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
  
  await addToFile(schedulePath, item, '# Work Scheduled Items\\n\\n', true, scheduleDateStr);
  await removeFromInbox(item);
}

// Personal-specific processing functions  
async function moveToPersonalReadingList(item) {
  const personalPath = path.join(OBSIDIAN_PATH, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const readingListPath = path.join(personalPath, 'Reading List.md');
  await addToFile(readingListPath, item, '# Personal Reading List\\n\\n', true);
  await removeFromInbox(item);
}

async function archivePersonalItem(item) {
  const personalPath = path.join(OBSIDIAN_PATH, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const archivePath = path.join(personalPath, 'Archive.md');
  await addToFile(archivePath, item, '# Personal Archive\\n\\n', true);
  await removeFromInbox(item);
}

async function schedulePersonalItem(item) {
  const personalPath = path.join(OBSIDIAN_PATH, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const schedulePath = path.join(personalPath, 'Scheduled.md');
  const scheduleDate = getNextPersonalTime();
  const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
  
  await addToFile(schedulePath, item, '# Personal Scheduled Items\\n\\n', true, scheduleDateStr);
  await removeFromInbox(item);
}

// Classification functions
async function classifyAsWork(item) {
  const originalClassification = contentClassifier.classifyContent(item);
  contentClassifier.learnFromFeedback(item, 'work', originalClassification);
  await moveToWorkReadingList(item);
}

async function classifyAsPersonal(item) {
  const originalClassification = contentClassifier.classifyContent(item);
  contentClassifier.learnFromFeedback(item, 'personal', originalClassification);
  await moveToPersonalReadingList(item);
}

// Utility functions
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function addToFile(filePath, item, header, includeClassification = false, customDate = null) {
  try {
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      content = header;
    }
    
    const timestamp = customDate || item.timestamp;
    let newEntry = `${timestamp} ${item.content}`;
    
    if (includeClassification && item.classification) {
      const tags = item.classification.suggestedTags.join(' ');
      newEntry += ` ${tags}`;
      
      if (item.classification.confidence > 0) {
        newEntry += ` (confidence: ${item.classification.confidence.toFixed(2)})`;
      }
    }
    
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

process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down server...');
  fileWatcher.close();
  process.exit(0);
});