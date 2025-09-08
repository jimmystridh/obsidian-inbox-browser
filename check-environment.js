const fs = require('fs').promises;
const path = require('path');

async function checkEnvironment() {
  console.log('🔍 Checking environment setup...\n');

  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`📦 Node.js version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    console.log('⚠️  Warning: Node.js 18+ recommended for Electron compatibility');
  } else {
    console.log('✅ Node.js version compatible');
  }

  // Check if Playwright browsers are installed
  try {
    const { chromium } = require('playwright');
    console.log('✅ Playwright chromium available');
    
    // Try to launch browser to verify it works
    try {
      const browser = await chromium.launch({ headless: true });
      await browser.close();
      console.log('✅ Playwright browser can be launched successfully');
    } catch (launchError) {
      console.log('❌ Playwright browser launch failed:', launchError.message);
      console.log('💡 Try running: npx playwright install chromium');
    }
  } catch (error) {
    console.log('❌ Playwright not found:', error.message);
    console.log('💡 Try running: npm install playwright');
  }

  // Check for .env file and Bluesky credentials
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    const hasBlueskyId = envContent.includes('BSKY_IDENTIFIER');
    const hasBlueskyPassword = envContent.includes('BSKY_APP_PASSWORD');
    
    console.log(`✅ .env file found`);
    console.log(`📘 Bluesky identifier: ${hasBlueskyId ? '✅' : '❌'}`);
    console.log(`🔐 Bluesky app password: ${hasBlueskyPassword ? '✅' : '❌'}`);
    
    if (hasBlueskyId && hasBlueskyPassword) {
      console.log('🎯 Bluesky API will work with full authentication');
    } else {
      console.log('ℹ️  Bluesky API will work with public endpoints only');
    }
  } catch (error) {
    console.log('📘 No .env file found - Bluesky will use public endpoints only');
  }

  // Check cache directory
  try {
    const cacheDir = path.join(process.cwd(), 'cache');
    await fs.access(cacheDir);
    console.log('✅ Cache directory exists');
  } catch (error) {
    console.log('ℹ️  Cache directory will be created automatically');
  }

  // Check Obsidian path (if on macOS)
  try {
    const obsidianPath = path.join(
      process.env.HOME || '',
      'Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md'
    );
    await fs.access(obsidianPath);
    console.log('✅ Obsidian inbox file found');
  } catch (error) {
    console.log('⚠️  Obsidian inbox file not found at expected location');
    console.log('   Expected: ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/JS/0ZK/Inbox.md');
  }

  console.log('\n🎉 Environment check completed!');
}

// Run the check
if (require.main === module) {
  checkEnvironment().catch(console.error);
}

module.exports = { checkEnvironment };