/**
 * Lighthouse Accessibility Audit Script
 *
 * Runs Lighthouse accessibility audits on all app pages.
 * Uses local-only mode (no Firebase) so auth is bypassed and sample data is loaded.
 *
 * Usage: bun run lighthouse
 *
 * Prerequisites:
 *   - Chromium installed via Playwright: bunx playwright install chromium
 *
 * Outputs HTML reports to lighthouse-reports/
 */

import { execSync, spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const REPORTS_DIR = join(PROJECT_ROOT, 'lighthouse-reports');
const DEV_SERVER_URL = 'http://localhost:5174'; // Use different port to avoid conflicts
const PAGES = [
  { name: 'my-cards', path: '/' },
  { name: 'deal', path: '/deal' },
  { name: 'more', path: '/more' },
];

// Find Playwright's Chromium binary
function findChromium() {
  try {
    const result = execSync('npx playwright install --dry-run chromium 2>&1 || true', {
      encoding: 'utf-8',
      cwd: PROJECT_ROOT,
    });
    // Try the standard Playwright chromium path
    const browserPath = execSync(
      "node -e \"const {chromium} = require('playwright-core'); console.log(chromium.executablePath())\"",
      { encoding: 'utf-8', cwd: PROJECT_ROOT }
    ).trim();
    if (existsSync(browserPath)) return browserPath;
  } catch {
    // ignore
  }

  // Fallback: common macOS Chrome paths
  const fallbacks = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const path of fallbacks) {
    if (existsSync(path)) return path;
  }

  throw new Error(
    'Could not find Chrome/Chromium. Install via: bunx playwright install chromium'
  );
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function runLighthouse(url, outputPath, chromePath) {
  const lighthouse = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');

  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const result = await lighthouse.default(url, {
      port: chrome.port,
      output: 'html',
      onlyCategories: ['accessibility'],
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 412,
        height: 915,
        deviceScaleFactor: 2.625,
        disabled: false,
      },
    });

    const { writeFileSync } = await import('node:fs');
    writeFileSync(outputPath, result.report);

    const score = result.lhr.categories.accessibility.score * 100;
    return score;
  } finally {
    await chrome.kill();
  }
}

async function main() {
  console.log('🔍 Lighthouse Accessibility Audit\n');

  // Ensure reports directory exists
  mkdirSync(REPORTS_DIR, { recursive: true });

  // Find Chrome
  const chromePath = findChromium();
  console.log(`Browser: ${chromePath}\n`);

  // Start Vite dev server without Firebase (auth bypassed, sample data loaded)
  console.log('Starting dev server...');
  const devServer = spawn('npx', ['vite', '--port', '5174', '--no-open'], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      VITE_FIREBASE_PROJECT_ID: '',
      VITE_FIREBASE_API_KEY: '',
    },
    stdio: 'pipe',
  });

  let serverOutput = '';
  devServer.stdout.on('data', (d) => (serverOutput += d.toString()));
  devServer.stderr.on('data', (d) => (serverOutput += d.toString()));

  try {
    await waitForServer(DEV_SERVER_URL);
    console.log('Dev server ready.\n');

    // Seed localStorage with sample data by loading the page first
    // (The app auto-seeds when isFirebaseConfigured is false)

    const results = [];
    for (const page of PAGES) {
      const url = `${DEV_SERVER_URL}${page.path}`;
      const reportPath = join(REPORTS_DIR, `${page.name}.html`);
      console.log(`Auditing: ${page.name} (${url})`);

      try {
        const score = await runLighthouse(url, reportPath, chromePath);
        results.push({ page: page.name, score, report: reportPath });
        console.log(`  Score: ${score}/100 → ${reportPath}\n`);
      } catch (err) {
        console.error(`  Failed: ${err.message}\n`);
        results.push({ page: page.name, score: null, error: err.message });
      }
    }

    // Summary
    console.log('━'.repeat(50));
    console.log('Summary:');
    for (const r of results) {
      const icon = r.score === null ? '❌' : r.score >= 90 ? '✅' : r.score >= 50 ? '⚠️' : '🔴';
      console.log(`  ${icon} ${r.page}: ${r.score ?? 'FAILED'}/100`);
    }
    console.log(`\nReports saved to: ${REPORTS_DIR}/`);
  } finally {
    devServer.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
