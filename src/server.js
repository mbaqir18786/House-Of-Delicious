const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Resolve static files directory cleanly
const PUBLIC_ROOT = (() => {
  const candidate1 = path.join(__dirname, '..', 'docs');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.join(__dirname, '..', 'public');
  if (fs.existsSync(candidate2)) return candidate2;
  const candidate3 = path.join(__dirname, 'docs');
  if (fs.existsSync(candidate3)) return candidate3;
  return path.join(__dirname, '..');
})();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function getCacheControl(pathname, ext) {
  if (pathname.includes('/_next/static/') || ext === '.woff2' || ext === '.webp' || ext === '.png') {
    return 'public, max-age=31536000, immutable';
  }
  if (ext === '.html') {
    return 'public, max-age=0, must-revalidate';
  }
  return 'public, max-age=86400';
}

function sendFile(res, filePath, contentType, cacheControl) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  // Healthcheck endpoint for Docker / Kubernetes / Monitoring
  if (pathname === '/health' || pathname === '/api/health') {
    const payload = JSON.stringify({
      status: 'healthy',
      app: 'House of Delicious (HOD)',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    return res.end(payload);
  }

  // Handle Next.js dynamic image endpoint: /_next/image?url=...
  if (pathname === '/_next/image') {
    const targetUrl = reqUrl.searchParams.get('url');
    if (targetUrl) {
      let imageRelPath = targetUrl.startsWith('/') ? targetUrl.slice(1) : targetUrl;
      let localImagePath = path.join(PUBLIC_ROOT, imageRelPath);
      if (fs.existsSync(localImagePath) && fs.statSync(localImagePath).isFile()) {
        const ext = path.extname(localImagePath).toLowerCase();
        return sendFile(res, localImagePath, MIME_TYPES[ext] || 'image/webp', 'public, max-age=31536000, immutable');
      }
    }
  }

  // Route shortcuts
  if (pathname === '/' || pathname === '') {
    return sendFile(res, path.join(PUBLIC_ROOT, 'index.html'), 'text/html; charset=utf-8', 'public, max-age=0, must-revalidate');
  }
  if (pathname === '/menu') {
    return sendFile(res, path.join(PUBLIC_ROOT, 'menu.html'), 'text/html; charset=utf-8', 'public, max-age=0, must-revalidate');
  }
  if (pathname === '/spices') {
    return sendFile(res, path.join(PUBLIC_ROOT, 'spices.html'), 'text/html; charset=utf-8', 'public, max-age=0, must-revalidate');
  }
  if (pathname === '/contact') {
    return sendFile(res, path.join(PUBLIC_ROOT, 'contact.html'), 'text/html; charset=utf-8', 'public, max-age=0, must-revalidate');
  }

  // General static file lookup
  let relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  let fullPath = path.join(PUBLIC_ROOT, relativePath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    return sendFile(res, fullPath, MIME_TYPES[ext] || 'application/octet-stream', getCacheControl(pathname, ext));
  }

  // Tilde alternative lookup (e.g. 0pqt~8bl3ukh4.js <-> 0pqt8bl3ukh4.js)
  let altPath = null;
  if (relativePath.includes('~')) {
    altPath = path.join(PUBLIC_ROOT, relativePath.replace(/~/g, ''));
  }
  if (altPath && fs.existsSync(altPath) && fs.statSync(altPath).isFile()) {
    const ext = path.extname(altPath).toLowerCase();
    return sendFile(res, altPath, MIME_TYPES[ext] || 'application/octet-stream', getCacheControl(pathname, ext));
  }

  // Extension check (e.g. /menu -> menu.html)
  if (fs.existsSync(fullPath + '.html')) {
    return sendFile(res, fullPath + '.html', 'text/html; charset=utf-8', 'public, max-age=0, must-revalidate');
  }

  // SPA fallback
  sendFile(res, path.join(PUBLIC_ROOT, 'index.html'), 'text/html; charset=utf-8', 'public, max-age=0, must-revalidate');
});

server.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`  🍕 House of Delicious (HOD) — Production Server`);
  console.log(`  Local URL:       http://localhost:${PORT}`);
  console.log(`  Menu:            http://localhost:${PORT}/menu`);
  console.log(`  Kitchen:         http://localhost:${PORT}/spices`);
  console.log(`  Contact:         http://localhost:${PORT}/contact`);
  console.log(`  Health Check:    http://localhost:${PORT}/health`);
  console.log(`  Static Root:     ${PUBLIC_ROOT}`);
  console.log(`======================================================\n`);
});

// Graceful shutdown handling
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed successfully. Exiting.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forcefully terminating.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = server;
