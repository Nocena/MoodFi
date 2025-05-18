// server.mjs - HTTPS proxy server for development
import { createServer as createHttpsServer } from 'https';
import http from 'http';
import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HTTPS configuration - using Vite default ports
const httpsPort = 5174; // For HTTPS Vite
const httpPort = 5173;  // Default port for Vite

// Check for certificate files
const certFile = process.env.SSL_CRT_FILE || 'certificates/dev.cert';
const keyFile = process.env.SSL_KEY_FILE || 'certificates/dev.key';

// Check if certificate files exist
if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
  console.error(`SSL certificate files not found: ${certFile} or ${keyFile}`);
  console.error('Please run the setup-https.sh script first to generate certificates.');
  process.exit(1);
}

// HTTPS server options
const httpsOptions = {
  key: fs.readFileSync(keyFile),
  cert: fs.readFileSync(certFile)
};

// Start Vite development server in a child process
console.log(`Starting Vite development server on port ${httpPort}...`);
const viteProcess = exec(`npx vite --port ${httpPort}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting Vite server: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Vite server stderr: ${stderr}`);
    return;
  }
  
  console.log(`Vite server stdout: ${stdout}`);
});

// Listen for process termination and kill child process
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteProcess.kill();
  process.exit();
});

// Create a simple HTTPS proxy server that forwards to the Vite server
const httpsServer = createHttpsServer(httpsOptions, (req, res) => {
  // Fixed: Properly create HTTP request to Vite server
  const options = {
    hostname: 'localhost',
    port: httpPort,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward the Vite server response back to the client
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  // Handle proxy errors
  proxyReq.on('error', (error) => {
    console.error('Proxy request error:', error);
    res.writeHead(500);
    res.end('Proxy error: ' + error.message);
  });

  // Forward the original request body to the Vite server
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Start the HTTPS server
httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS server running at https://localhost:${httpsPort}`);
  console.log(`Proxying requests to Vite server at http://localhost:${httpPort}`);
  console.log(`NOTE: The first few requests might fail while Vite is starting up.`);
  console.log(`You may need to refresh the page if the first load doesn't work.`);
});