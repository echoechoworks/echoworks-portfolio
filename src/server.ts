import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

const port: number = Number(process.env.PORT || 3000);
const routes: Record<string, string> = {
  '/': 'public/index.html',
  '/projects': 'public/projects.html',
  '/about': 'public/about.html',
  '/app.js': 'src/app.ts',
  '/styles.css': 'public/styles.css',
  '/tailwind.js': 'public/tailwind.js',
};
const publicRoot = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const mimeTypes: Record<string, string> = {
  '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  const path = new URL(req.url || '/', 'http://localhost').pathname;
  if (path === '/favicon.ico') { res.writeHead(204).end(); return; }
  const routeFile = path.startsWith('/projects/') ? 'public/project.html' : routes[path];
  const assetFile = path.startsWith('/assets/') ? resolve(publicRoot, '.' + path) : undefined;
  const file = assetFile || routeFile;
  if (!file || (assetFile && !assetFile.startsWith(publicRoot + sep))) { res.writeHead(404).end('Page not found'); return; }
  try {
    const extension = extname(file).toLowerCase();
    const isAsset = Boolean(assetFile);
    const isMedia = isAsset && ['.mp4', '.wav', '.mp3'].includes(extension);
    if (isMedia) {
      const info = await stat(file);
      const range = req.headers.range;
      const contentType = mimeTypes[extension] || 'application/octet-stream';
      if (range) {
        const match = /bytes=(\d*)-(\d*)/.exec(range);
        const start = Number(match?.[1] || 0);
        const end = Math.min(Number(match?.[2] || info.size - 1), info.size - 1);
        if (start > end || start >= info.size) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
        res.writeHead(206, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${info.size}` });
        createReadStream(file, { start, end }).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Length': info.size });
        createReadStream(file).pipe(res);
      }
      return;
    }
    const isBinary = isAsset && ['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(extension);
    let body: string | Buffer = await readFile(assetFile ? file : new URL('../' + file, import.meta.url), isBinary ? undefined : 'utf8');
    if (file.endsWith('.ts')) body = stripTypeScriptTypes(body as string);
    if (file.endsWith('.html')) {
      if (file !== 'public/index.html') {
        const landing = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
        const header = landing.match(/<!-- BEGIN: TopNavigation -->[\s\S]*?<!-- END: TopNavigation -->/)?.[0] || '';
        body = (body as string).replace('<!-- GLOBAL_HEADER -->', header);
      }
      const footer = await readFile(new URL('../public/footer.html', import.meta.url), 'utf8');
      body = (body as string).replace('<!-- GLOBAL_FOOTER -->', footer);
    }
    res.writeHead(200, { 'Content-Type': /\.(ts|js)$/.test(file) ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : mimeTypes[extension] || 'text/html; charset=utf-8' });
    res.end(body);
  } catch { res.writeHead(500).end('Unable to load page'); }
}).listen(port, '0.0.0.0', () => console.log(`Portfolio ready at http://localhost:${port}`));
