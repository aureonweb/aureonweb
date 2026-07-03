/* ============================================================
   servidor-local.cjs
   Mini-servidor para VER EL SITIO COMPLETO en tu computadora,
   tal como se verá publicado (incluida el Aula Virtual).

   No lo abras directamente: usa "Ver-Sitio-Local.bat".
   Para detenerlo: cierra la ventana o pulsa Ctrl+C.
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf'
};

function makeServer() {
  return http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.stat(filePath, (err, st) => {
      if (err || !st.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404: ' + urlPath);
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      fs.createReadStream(filePath).pipe(res);
    });
  });
}

// Intenta varios puertos por si alguno está ocupado.
const PORTS = [8080, 8181, 8888, 4599, 3000];
let idx = 0;

function tryListen() {
  const server = makeServer();
  const port = PORTS[idx];
  server.once('error', (e) => {
    if (e.code === 'EADDRINUSE' && idx < PORTS.length - 1) { idx++; tryListen(); }
    else { console.error('No se pudo iniciar el servidor:', e.message); process.exit(1); }
  });
  server.listen(port, () => {
    const base = 'http://localhost:' + port;
    console.log('');
    console.log('  ======================================================');
    console.log('    Vida ZhiNeng QiGong  -  servidor local ACTIVO');
    console.log('  ======================================================');
    console.log('    Sitio:  ' + base + '/');
    console.log('    Aula:   ' + base + '/aula.html');
    console.log('    Panel:  ' + base + '/admin.html');
    console.log('  ------------------------------------------------------');
    console.log('    Para DETENER: cierra esta ventana (o pulsa Ctrl+C)');
    console.log('  ======================================================');
    console.log('');
    if (!process.env.NO_OPEN) {
      exec('start "" "' + base + '/index.html"');
    }
  });
}

tryListen();
