const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let server;

// Simple zero-dependency mime-type lookup for serving static assets
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Start a local HTTP server to serve the exported 'dist' folder.
// This is necessary because Expo Router uses absolute paths (e.g. /_expo/...)
// which fail under the file:// protocol.
function startLocalServer(callback) {
  const distPath = path.join(__dirname, 'dist');
  
  server = http.createServer((req, res) => {
    // Decode URI to handle spaces/special characters in filenames
    let safeUrl = decodeURIComponent(req.url.split('?')[0]);
    if (safeUrl === '/') safeUrl = '/index.html';

    let filePath = path.join(distPath, safeUrl);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(distPath)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    // Check if the requested file exists
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // If file doesn't exist, fallback to index.html (crucial for Single Page App routing)
        filePath = path.join(distPath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Internal Server Error');
      });
      stream.pipe(res);
    });
  });

  // Listen on a random available port (0 lets OS pick one)
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    console.log(`Production server running at http://127.0.0.1:${port}`);
    callback(port);
  });
}

function createWindow(port = null) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'assets/images/icon.png'),
  });

  // Check if we are in development mode (passed via environment variable)
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

  if (isDev) {
    // In dev mode, load the Expo web dev server (default is usually http://localhost:8081 or http://localhost:19006)
    const devUrl = process.env.DEV_URL || 'http://localhost:8081';
    console.log(`Connecting to Expo Web dev server: ${devUrl}`);
    mainWindow.loadURL(devUrl);
    
    // Open Chrome developer tools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the local HTTP server we spun up
    mainWindow.loadURL(`http://127.0.0.1:${port}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
  
  if (isDev) {
    createWindow();
  } else {
    startLocalServer((port) => {
      createWindow(port);
    });
  }
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay active until the user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
    if (isDev) {
      createWindow();
    } else {
      if (server && server.listening) {
        createWindow(server.address().port);
      } else {
        startLocalServer((port) => {
          createWindow(port);
        });
      }
    }
  }
});

// Clean up server on exit
app.on('will-quit', () => {
  if (server) {
    server.close();
  }
});
