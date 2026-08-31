/*
 * fvsnapshot.js — capture the prerendered snapshot a page is missing.
 *
 * Every bundled page ships a `#__seo_prerender` block: a copy of the rendered
 * DOM, served in the HTML so that crawlers which do not run JavaScript still
 * read the page. The bundler discards it the moment it boots, so it costs a
 * visitor nothing and is the only thing an AI answer engine sees.
 *
 * A page without one serves its title and "This page requires JavaScript to
 * display." and nothing else. This boots the page in a real browser, waits
 * for the bundle to build the DOM, and writes that DOM back into the file as
 * the snapshot.
 *
 * Accordions are captured as they render, which means closed panels produce
 * no DOM — run tools/fvexpand.js afterwards to write those panels in.
 *
 *   node tools/fvsnapshot.js advanced-excel
 *   node tools/fvsnapshot.js advanced-excel --dry-run
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
let PORT = 0;

const CHROME = [
  path.join(process.env.LOCALAPPDATA || '', 'ms-playwright/chromium-1234/chrome-win64/chrome.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
].find((p) => fs.existsSync(p));

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
};

function serve() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(0);
}

/** Boot the page and hand back the <body> the bundler built. */
async function renderBody(browser, slug) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));

  await page.goto(`http://localhost:${PORT}/${slug}/`, { waitUntil: 'load' });

  // Wait for the bundle to consume its manifest. On a fast local server it is
  // often gone before the first poll, so a page that has clearly already built
  // its DOM counts as booted rather than as a page that never started.
  await page.waitForFunction(
    () => !document.querySelector('script[type="__bundler/manifest"]')
      && document.body.innerHTML.length > 20000,
    { timeout: 30000 }
  );
  await page.waitForTimeout(1500); // let late images and fonts settle

  const body = await page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    // Scripts re-run when the snapshot is parsed; the bundle boots itself.
    clone.querySelectorAll('script').forEach((n) => n.remove());
    // The captured markup carries no leading blank line: tools/fvedit.js
    // matches the snapshot's opening bytes exactly.
    return clone.innerHTML.replace(/^\s*\n/, '');
  });

  const title = await page.title();
  await page.close();
  return { body, title, errors };
}

function inject(slug, body, dryRun) {
  const file = path.join(ROOT, slug, 'index.html');
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes('<div id="__seo_prerender"')) {
    throw new Error(`${slug}: already has a snapshot — use tools/fvexpand.js instead`);
  }
  const at = src.indexOf('<body');
  if (at === -1) throw new Error(`${slug}: no <body>`);
  const open = src.indexOf('>', at) + 1;

  const block = `\n<div id="__seo_prerender" aria-hidden="false">\n${body}\n</div>\n`;
  const out = src.slice(0, open) + block + src.slice(open);

  if (dryRun) {
    console.log(`${slug}: would add ${block.length} bytes of snapshot`);
    return;
  }
  fs.writeFileSync(file, out);
  console.log(`/${slug}/ — snapshot written, ${block.length} bytes`);
}

(async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const slugs = args.filter((a) => !a.startsWith('--'));
  if (!slugs.length) {
    console.error('usage: node tools/fvsnapshot.js <slug>... [--dry-run]');
    process.exit(2);
  }
  if (!CHROME) throw new Error('no Playwright Chromium found');

  const server = serve();
  PORT = server.address().port;
  const browser = await chromium.launch({ executablePath: CHROME });
  try {
    for (const slug of slugs) {
      const { body, title, errors } = await renderBody(browser, slug);
      if (errors.length) {
        console.error(`${slug}: page errors, refusing to capture:\n  ${errors.join('\n  ')}`);
        process.exitCode = 1;
        continue;
      }
      if (body.length < 5000) {
        console.error(`${slug}: rendered only ${body.length} bytes — the bundle probably did not boot`);
        process.exitCode = 1;
        continue;
      }
      console.log(`${slug}: rendered "${title}" (${body.length} bytes)`);
      inject(slug, body, dryRun);
    }
  } finally {
    await browser.close();
    server.close();
  }
})();
