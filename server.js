const http = require('http');
const fs = require('fs');
const path = require('path');

const PRIMARY_PORT = process.env.PORT || 3000;
const SECONDARY_PORT = 8085;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function requestHandler(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === '/') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const targetPath = path.join(__dirname, safePath);

  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('404 Not Found: ' + pathname);
    return;
  }

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(targetPath);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  });

  fs.createReadStream(targetPath).pipe(res);
}

function startServer(port) {
  const s = http.createServer(requestHandler);
  s.listen(port, '127.0.0.1', () => {
    console.log(`Material Error Dashboard server running at: http://127.0.0.1:${port}/`);
  });
  s.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying next...`);
    } else {
      console.error(err);
    }
  });
  return s;
}

if (require.main === module) {
  startServer(PRIMARY_PORT);
  startServer(SECONDARY_PORT);
}

module.exports = requestHandler;
