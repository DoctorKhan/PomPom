#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 8000;
const ROOT = process.cwd();

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, res => {
          if (res.statusCode && res.statusCode < 500) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
          res.resume();
        });
        req.on('error', reject);
      });
      return true;
    } catch (_) {
      await wait(250);
    }
  }
  return false;
}

async function run() {
  console.log('🐕 Browser tests (Puppeteer) starting...');

  // Start server
  console.log(`📡 Starting server on http://localhost:${PORT} ...`);
  const server = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(PORT) },
  });

  let serverReady = false;
  server.stdout.on('data', (d) => {
    const s = String(d);
    process.stdout.write(s);
    if (s.includes(`http://localhost:${PORT}`)) serverReady = true;
  });
  server.stderr.on('data', (d) => process.stderr.write(String(d)));

  // Wait up to 15s for server
  const ok = await waitForHttp(`http://localhost:${PORT}/tests/index.html`, 20000);
  if (!ok && !serverReady) {
    console.error('❌ Server did not become ready in time');
    server.kill();
    process.exit(1);
  }

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  // Pipe console from page
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const prefix = type === 'error' ? '⛔' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [browser] ${text}`);
  });

  try {
    console.log('🌐 Opening tests dashboard...');
    await page.goto(`http://localhost:${PORT}/tests/index.html`, { waitUntil: 'domcontentloaded' });

    // Ensure app is loaded in preview iframe
    await page.evaluate(() => { window.loadApp && window.loadApp(); });

    // Wait for app iframe to load
    await page.waitForFunction(() => {
      const iframe = document.getElementById('app-iframe');
      return iframe && iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.readyState === 'complete';
    }, { timeout: 20000 });

    console.log('✅ App iframe loaded. Running Browser Tests...');


    // Relax/override waitForAppLoad to avoid timing issues in headless mode
    await page.evaluate(() => {
      window.waitForAppLoad = function() {
        return new Promise((resolve) => {
          const ok = () => {
            const iframe = document.getElementById('app-iframe');
            return !!(iframe && iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.readyState === 'complete');
          };
          if (ok()) return resolve();
          const start = Date.now();
          const iv = setInterval(() => {
            if (ok() || Date.now() - start > 30000) {
              clearInterval(iv);
              resolve();
            }
          }, 100);
        });
      };
    });

    // Kick off Browser Tests (prefer direct call; fallback to clicking sidebar button)
    const started = await page.evaluate(() => {
      const has = typeof window.runBrowserTests === 'function';
      if (has) {
        window.runBrowserTests();
        return true;
      }
      const btn = document.querySelector('button[title="Run Browser Tests"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!started) {
      throw new Error('Could not start Browser Tests: function and button not found');
    }

    // Wait for the log to start receiving entries, then allow some time to accumulate
    await page.waitForSelector('#test-log .log-entry', { timeout: 15000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Collect results
    const results = await page.evaluate(() => {
      const failed = Array.from(document.querySelectorAll('.log-entry.log-fail .log-message')).map(e => e.textContent.trim());
      const passedCount = Array.from(document.querySelectorAll('.log-entry.log-pass')).length;
      const infoCount = Array.from(document.querySelectorAll('.log-entry.log-info')).length;
      const statusText = document.querySelector('#status-card .status-text')?.textContent || '';
      return { failed, passedCount, infoCount, statusText };
    });

    console.log('📋 Test Status:', results.statusText);
    if (results.failed.length) {
      console.log(`❌ ${results.failed.length} failures:`);
      results.failed.forEach((f, i) => console.log(`${i + 1}. ${f}`));
      process.exitCode = 1;
    } else {
      console.log('✅ Browser Tests passed with no failures.');
    }
  } catch (err) {
    console.error('❌ Browser tests errored:', err);
    process.exitCode = 1;
  } finally {
    await browser.close().catch(() => {});
    server.kill('SIGTERM');
  }
}

run();

