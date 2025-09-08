const { spawn } = require('child_process');
const waitOn = require('wait-on');

const startElectron = async () => {
  console.log('Waiting for React dev server...');
  
  try {
    await waitOn({
      resources: ['http://localhost:3000'],
      timeout: 30000
    });
    
    console.log('React dev server is ready, starting Electron...');
    
    const electron = spawn('npx', ['electron', '.'], {
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_IS_DEV: '1' }
    });
    
    electron.on('close', (code) => {
      console.log(`Electron exited with code ${code}`);
    });
    
  } catch (error) {
    console.error('Failed to start Electron:', error);
  }
};

startElectron();