// The e2e web server: static files from the export, falling back to the app's
// index.html for client-side routes. Usage: node serve.mjs <dir> <port>
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const [dir, port] = process.argv.slice(2);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
const file = (p) => {
  const f = join(dir, normalize(p).replace(/^(\.\.[/\\])+/, ''));
  return existsSync(f) && statSync(f).isFile() ? f : null;
};
createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const found = file(path) ?? file('/index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(found)] ?? 'application/octet-stream' });
  res.end(readFileSync(found));
}).listen(Number(port));
