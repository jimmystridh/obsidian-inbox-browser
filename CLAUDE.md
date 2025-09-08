# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron-based application for processing Obsidian inbox items with rich metadata previews and automated categorization. The app provides a React frontend with an Express backend for file processing and metadata fetching.

## Development Commands

### Starting the Application
```bash
# Development mode (React + Electron)
npm run dev

# React development server only (for web testing)
npm run dev-react  # Runs on http://localhost:6111

# Standalone server
npm run server     # Runs on http://localhost:6112

# Electron in development
npm run electron-dev
```

### Building and Testing
```bash
# Build React app for production
npm run build

# Run tests
npm run test

# Package Electron app
npm run electron-pack
```

## Architecture

### Key Components

**Frontend (React)**
- `src/App.js` - Main React application entry point
- `src/components/InboxBrowser.js` - Main UI for browsing inbox items
- `src/components/InboxItem.js` - Individual item cards with rich previews and actions
- `src/components/Sidebar.js` - Navigation and filtering sidebar

**Backend Services**
- `src/services/InboxParser.js` - Parses Obsidian markdown files into structured items
- `src/services/MetadataFetcher.js` - Fetches rich metadata from URLs (Twitter, GitHub, YouTube, etc.)
- `src/services/ContentClassifier.js` - AI-powered content classification and tagging
- `src/services/TwitterAPIService.js` - Twitter/X API integration for enhanced tweet metadata
- `src/services/PersistentCache.js` - SQLite-based caching for metadata

**Electron Process**
- `src/main.js` - Electron main process with window management and IPC
- `src/preload.js` - Electron preload script for secure IPC communication
- `server.js` - Express server with API endpoints and real-time file watching

### Data Flow

1. **File Watching**: Chokidar monitors `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md`
2. **Parsing**: InboxParser extracts timestamped items from the inbox markdown
3. **Classification**: ContentClassifier categorizes items (work/personal, content type)
4. **Metadata**: MetadataFetcher enriches items with previews, thumbnails, and metadata
5. **Processing**: Items can be moved to Reading List, Archive, Scheduled, or Insights files

### API Endpoints

- `GET /api/inbox` - Get all inbox items
- `POST /api/metadata` - Fetch metadata for a URL
- `POST /api/process-item` - Process item with specific action
- `POST /api/classify-item` - Classify content type
- `GET /api/classification-stats` - Get classification statistics
- `POST /api/bulk-classify` - Get bulk classification suggestions

### Content Types Recognized

The app automatically detects and provides rich previews for:
- Twitter/X posts (with API integration)
- YouTube videos
- GitHub repositories  
- Spotify content
- Articles with OpenGraph metadata
- Personal notes (Swedish/English)

### File Structure

Items are processed into organized Obsidian files:
- `Reading List.md` - Items marked for later reading
- `Archive.md` - Archived items with timestamps
- `Scheduled.md` - Items scheduled for future review
- `Insights.md` - Extracted insights and key points
- `Work/` and `Personal/` subdirectories for categorized items

### Caching Strategy

The app uses SQLite via PersistentCache for:
- Metadata caching to avoid repeated API calls
- Rate limiting compliance
- Offline functionality

### Testing

The codebase uses React Testing Library for component tests. Run tests with standard React Scripts commands.

### Configuration

Key configuration values:
- Inbox path: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md`
- React dev port: 6111
- Express server port: 6112
- Electron requires Node.js 18 or 20 for compatibility