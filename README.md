# Obsidian Inbox Browser

A powerful Electron application for processing your Obsidian inbox with rich previews, smart categorization, and bulk actions.

## Features

### 🔍 Smart Content Recognition
- Automatically detects and categorizes different content types:
  - **Twitter/X posts** - with author and tweet preview
  - **Threads posts** - Meta's social platform content
  - **YouTube videos** - with thumbnails and metadata
  - **GitHub repositories** - with stars, language, and descriptions
  - **Articles & Links** - with rich OpenGraph previews
  - **Personal Notes** - Swedish and English content
  - **Spotify Content** - tracks, episodes, and shows

### 📋 Advanced Processing Actions
- **Read Later** - Move to dedicated reading queue
- **Archive** - Organize by topic and date
- **Schedule** - Set reminders for future review
- **Extract** - Pull insights into permanent notes
- **Delete** - Remove irrelevant items
- **Bulk Operations** - Process multiple items at once

### 🎯 Smart Organization
- Real-time file watching for Obsidian integration
- Advanced filtering by content type
- Search across all items
- Statistics and analytics dashboard
- Automatic duplicate detection

### 🖥️ Modern Interface
- Clean, card-based design
- Keyboard shortcuts for rapid processing
- Rich metadata previews
- Progress tracking and stats

## Installation

1. **Clone or download** this project to your desired location
2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

### Development Mode

1. **Start the React development server**:
   ```bash
   npm run dev-react
   ```
   
2. **In a new terminal, start Electron**:
   ```bash
   npm run electron-dev
   ```

### Production Mode

1. **Build the React app**:
   ```bash
   npm run build
   ```
   
2. **Start the Electron app**:
   ```bash
   npm start
   ```

### Alternative Simple Version

If you encounter dependency issues, you can run the React app standalone in your browser:

1. **Start React dev server**:
   ```bash
   npm run dev-react
   ```
   
2. **Open** http://localhost:3000 in your browser

## Configuration

The app automatically looks for your Obsidian inbox at:
```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md
```

## Inbox Format

Your inbox should contain items in this format:
```
2024-05-20 16:47:59 [https://x.com/example/status/123](https://x.com/example/status/123)
2024-05-21 08:30:00 Some personal note or task
2024-05-22 12:15:30 [YouTube Video Title](https://youtube.com/watch?v=abc123)
```

## Processed Files Structure

The app creates and manages these files in your Obsidian vault:

- **Reading List.md** - Items marked for reading later
- **Archive.md** - Archived items organized by date
- **Scheduled.md** - Items scheduled for future review
- **Insights.md** - Extracted insights and key points

## Troubleshooting

### Electron Issues
If you encounter dependency conflicts with Electron:

1. **Clear node_modules**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Try different Node.js version**:
   ```bash
   # Use Node.js 18 or 20
   nvm install 18
   nvm use 18
   npm install
   ```

3. **Use the web version** as a fallback:
   ```bash
   npm run dev-react
   # Then open http://localhost:3000
   ```

### File Access Issues
Make sure the app has permission to read/write your Obsidian files:
- Check file permissions
- Ensure the Obsidian vault path is correct
- Try running with elevated permissions if needed

### Metadata Fetching
Some sites may block automated requests. The app handles this gracefully by:
- Showing basic information for blocked sites
- Caching successful requests
- Providing fallback metadata

## Development

### Project Structure
```
inbox_browser/
├── src/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Electron preload script
│   ├── App.js               # React main component
│   ├── components/          # React components
│   └── services/            # Backend services
├── public/                  # Static files
└── package.json            # Dependencies and scripts
```

### Key Components
- **InboxParser** - Parses Obsidian markdown files
- **MetadataFetcher** - Fetches rich previews from URLs
- **InboxBrowser** - Main UI for browsing items
- **InboxItem** - Individual item cards with actions

### Adding New Content Types
1. Update `InboxParser.js` to recognize the new type
2. Add metadata fetching logic in `MetadataFetcher.js`
3. Update UI components with appropriate icons and styling

## Performance

- **Caching** - Metadata is cached to avoid repeated requests
- **Rate Limiting** - Respects site rate limits with delays
- **Lazy Loading** - Metadata fetched on-demand
- **File Watching** - Only updates when inbox changes

## Privacy & Security

- **No Data Collection** - Everything runs locally
- **Secure Requests** - Uses HTTPS where available
- **Rate Limiting** - Respectful of external services
- **Local Cache Only** - No data sent to external servers

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## License

MIT License - feel free to use and modify as needed.

## Roadmap

- [ ] AI-powered content summarization
- [ ] Embedded web browser for previews
- [ ] Advanced keyboard shortcuts
- [ ] Plugin system for custom processors
- [ ] Export to various formats
- [ ] Integration with other note-taking apps
- [ ] Mobile companion app

---

**Happy processing!** 🚀