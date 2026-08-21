import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const portArg = process.argv.findIndex((arg) => arg === '--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : 4173);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.png':'image/png', '.mp4':'video/mp4' };

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    let path = normalize(join(root, urlPath === '/' ? 'index.html' : urlPath));
    if (!path.startsWith(root)) throw new Error('Bad path');
    const info = await stat(path);
    if (info.isDirectory()) path = join(path, 'index.html');
    const type = mime[extname(path)] || 'application/octet-stream';
    if (extname(path) === '.mp4' && req.headers.range) {
      const [startText, endText] = req.headers.range.replace('bytes=', '').split('-');
      const start = Number(startText);
      const end = endText ? Number(endText) : info.size - 1;
      res.writeHead(206, {
        'Content-Type': type,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${info.size}`,
        'Content-Length': end - start + 1,
        'Cache-Control': 'public, max-age=3600'
      });
      createReadStream(path, { start, end }).pipe(res);
      return;
    }
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': data.length, 'Accept-Ranges': extname(path) === '.mp4' ? 'bytes' : 'none', 'Cache-Control': extname(path) === '.mp4' ? 'public, max-age=3600' : 'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, '0.0.0.0');
