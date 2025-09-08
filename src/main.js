const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === '1';
const chokidar = require('chokidar');
const fs = require('fs').promises;
const { InboxParser } = require('./services/InboxParser');
const { MetadataFetcher } = require('./services/MetadataFetcher');
const { ContentClassifier } = require('./services/ContentClassifier');

let mainWindow;
let inboxParser;
let metadataFetcher;
let contentClassifier;
let fileWatcher;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize services
function initializeServices() {
  inboxParser = new InboxParser();
  metadataFetcher = new MetadataFetcher();
  contentClassifier = new ContentClassifier();
  
  // Setup file watcher for Obsidian files
  const obsidianPath = path.join(
    process.env.HOME,
    'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md'
  );
  
  fileWatcher = chokidar.watch(obsidianPath, {
    persistent: true,
    ignoreInitial: false
  });

  fileWatcher.on('change', async () => {
    if (mainWindow) {
      mainWindow.webContents.send('inbox-file-changed');
    }
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  initializeServices();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (fileWatcher) {
    fileWatcher.close();
  }
});

// IPC handlers
ipcMain.handle('load-inbox', async () => {
  try {
    const obsidianPath = path.join(
      process.env.HOME,
      'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md'
    );
    
    const content = await fs.readFile(obsidianPath, 'utf-8');
    const items = inboxParser.parseInboxContent(content);
    
    return { success: true, items };
  } catch (error) {
    console.error('Error loading inbox:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fetch-metadata', async (event, url) => {
  try {
    const metadata = await metadataFetcher.fetchMetadata(url);
    return { success: true, metadata };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-item', async (event, action, item) => {
  try {
    // Process the item based on action
    const result = await processInboxItem(action, item);
    return { success: true, result };
  } catch (error) {
    console.error('Error processing item:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

// Enhanced item processing function with work/personal separation
async function processInboxItem(action, item, context = {}) {
  const obsidianPath = path.join(
    process.env.HOME,
    'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK'
  );

  // Classify content if not already classified
  let classification = context.classification;
  if (!classification) {
    classification = contentClassifier.classifyContent(item);
  }

  // Add classification info to item for processing
  const enhancedItem = { ...item, classification };

  switch (action) {
    case 'read-later':
      await moveToReadingList(enhancedItem, obsidianPath);
      break;
    case 'read-later-work':
      await moveToWorkReadingList(enhancedItem, obsidianPath);
      break;
    case 'read-later-personal':
      await moveToPersonalReadingList(enhancedItem, obsidianPath);
      break;
    case 'archive':
      await archiveItem(enhancedItem, obsidianPath);
      break;
    case 'archive-work':
      await archiveWorkItem(enhancedItem, obsidianPath);
      break;
    case 'archive-personal':
      await archivePersonalItem(enhancedItem, obsidianPath);
      break;
    case 'schedule':
      await scheduleItem(enhancedItem, obsidianPath);
      break;
    case 'schedule-work':
      await scheduleWorkItem(enhancedItem, obsidianPath);
      break;
    case 'schedule-personal':
      await schedulePersonalItem(enhancedItem, obsidianPath);
      break;
    case 'extract':
      await extractInsights(enhancedItem, obsidianPath);
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

async function moveToReadingList(item, obsidianPath) {
  const readingListPath = path.join(obsidianPath, 'Reading List.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(readingListPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      content = '# Reading List\n\n';
    }
    
    const newEntry = `${item.timestamp} ${item.content}\n`;
    content += newEntry;
    
    await fs.writeFile(readingListPath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to move to reading list: ${error.message}`);
  }
}

async function archiveItem(item, obsidianPath) {
  const archivePath = path.join(obsidianPath, 'Archive.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(archivePath, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      content = '# Archive\n\n';
    }
    
    const newEntry = `${item.timestamp} ${item.content}\n`;
    content += newEntry;
    
    await fs.writeFile(archivePath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to archive item: ${error.message}`);
  }
}

async function scheduleItem(item, obsidianPath) {
  // For now, just add to a scheduled items file
  const schedulePath = path.join(obsidianPath, 'Scheduled.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(schedulePath, 'utf-8');
    } catch (error) {
      content = '# Scheduled Items\n\n';
    }
    
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 7); // Schedule for next week
    const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
    
    const newEntry = `${scheduleDateStr} ${item.content}\n`;
    content += newEntry;
    
    await fs.writeFile(schedulePath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to schedule item: ${error.message}`);
  }
}

async function extractInsights(item, obsidianPath) {
  const insightsPath = path.join(obsidianPath, 'Insights.md');
  
  try {
    let content = '';
    try {
      content = await fs.readFile(insightsPath, 'utf-8');
    } catch (error) {
      content = '# Insights\n\n';
    }
    
    const newEntry = `## From ${item.timestamp}\n${item.content}\n\n**Key Insights:**\n- [Add your insights here]\n\n---\n\n`;
    content += newEntry;
    
    await fs.writeFile(insightsPath, content, 'utf-8');
    await removeFromInbox(item);
  } catch (error) {
    throw new Error(`Failed to extract insights: ${error.message}`);
  }
}

// Work-specific processing functions
async function moveToWorkReadingList(item, obsidianPath) {
  const workPath = path.join(obsidianPath, 'Work');
  await ensureDirectoryExists(workPath);
  
  const readingListPath = path.join(workPath, 'Reading List.md');
  await addToFile(readingListPath, item, '# Work Reading List\n\n', true);
  await removeFromInbox(item);
}

async function archiveWorkItem(item, obsidianPath) {
  const workPath = path.join(obsidianPath, 'Work');
  await ensureDirectoryExists(workPath);
  
  const archivePath = path.join(workPath, 'Archive.md');
  await addToFile(archivePath, item, '# Work Archive\n\n', true);
  await removeFromInbox(item);
}

async function scheduleWorkItem(item, obsidianPath) {
  const workPath = path.join(obsidianPath, 'Work');
  await ensureDirectoryExists(workPath);
  
  const schedulePath = path.join(workPath, 'Scheduled.md');
  
  // Schedule for next workday
  const scheduleDate = getNextWorkday();
  const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
  
  await addToFile(schedulePath, item, '# Work Scheduled Items\n\n', true, scheduleDateStr);
  await removeFromInbox(item);
}

// Personal-specific processing functions  
async function moveToPersonalReadingList(item, obsidianPath) {
  const personalPath = path.join(obsidianPath, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const readingListPath = path.join(personalPath, 'Reading List.md');
  await addToFile(readingListPath, item, '# Personal Reading List\n\n', true);
  await removeFromInbox(item);
}

async function archivePersonalItem(item, obsidianPath) {
  const personalPath = path.join(obsidianPath, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const archivePath = path.join(personalPath, 'Archive.md');
  await addToFile(archivePath, item, '# Personal Archive\n\n', true);
  await removeFromInbox(item);
}

async function schedulePersonalItem(item, obsidianPath) {
  const personalPath = path.join(obsidianPath, 'Personal');
  await ensureDirectoryExists(personalPath);
  
  const schedulePath = path.join(personalPath, 'Scheduled.md');
  
  // Schedule for weekend or evening
  const scheduleDate = getNextPersonalTime();
  const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
  
  await addToFile(schedulePath, item, '# Personal Scheduled Items\n\n', true, scheduleDateStr);
  await removeFromInbox(item);
}

// Classification functions
async function classifyAsWork(item) {
  // Learn from user feedback
  const originalClassification = contentClassifier.classifyContent(item);
  contentClassifier.learnFromFeedback(item, 'work', originalClassification);
  
  // Move to work reading list
  const obsidianPath = path.join(
    process.env.HOME,
    'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK'
  );
  await moveToWorkReadingList(item, obsidianPath);
}

async function classifyAsPersonal(item) {
  // Learn from user feedback
  const originalClassification = contentClassifier.classifyContent(item);
  contentClassifier.learnFromFeedback(item, 'personal', originalClassification);
  
  // Move to personal reading list
  const obsidianPath = path.join(
    process.env.HOME,
    'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK'
  );
  await moveToPersonalReadingList(item, obsidianPath);
}

// Utility functions
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
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
    
    content += newEntry + '\n';
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to add to file ${filePath}: ${error.message}`);
  }
}

function getNextWorkday() {
  const date = new Date();
  const day = date.getDay();
  
  // If it's Friday (5), schedule for Monday (+3 days)
  // If it's Saturday (6), schedule for Monday (+2 days)  
  // If it's Sunday (0), schedule for Monday (+1 day)
  // Otherwise, schedule for tomorrow (+1 day)
  
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
  
  // If it's a weekday, schedule for weekend
  if (day >= 1 && day <= 5) {
    const daysUntilSaturday = 6 - day;
    date.setDate(date.getDate() + daysUntilSaturday);
  } else {
    // Already weekend, schedule for next weekend
    date.setDate(date.getDate() + 7);
  }
  
  return date;
}

async function removeFromInbox(item) {
  try {
    const inboxPath = path.join(
      process.env.HOME,
      'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md'
    );
    
    let content = await fs.readFile(inboxPath, 'utf-8');
    const lines = content.split('\n');
    
    // Find and remove the line matching this item
    const itemLine = `${item.timestamp} ${item.content}`;
    const filteredLines = lines.filter(line => !line.includes(itemLine));
    
    await fs.writeFile(inboxPath, filteredLines.join('\n'), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to remove from inbox: ${error.message}`);
  }
}