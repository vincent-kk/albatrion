/**
 * Real-browser mount bench — on-demand only (NOT wired into CI / guard).
 *
 *   yarn bench:browser                       # 50/100/500, 15 samples
 *   yarn bench:browser --samples=30 --sizes=100,1000
 *
 * Bundles harness.tsx (esbuild, prod React), loads it in headless Chromium
 * (Playwright), and measures per (mode, size):
 *   - mount  : wall-clock render() -> DOM settled (rAF-free macrotask poll;
 *              includes React work + real DOM construction + layout in a real
 *              engine — layout is the dimension jsdom cannot measure)
 *   - inputs/deferred/domNodes : settled DOM scope (baseline all vs eager-only)
 * Reports median / p95 and saves results/browser-<ts>.json.
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, dflt) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=')[1] : dflt;
};
const SIZES = arg('sizes', '50,100,500')
  .split(',')
  .map((s) => parseInt(s, 10));
const SAMPLES = parseInt(arg('samples', '15'), 10);
const WARMUP = parseInt(arg('warmup', '2'), 10);

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const p95 = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.ceil(s.length * 0.95) - 1)];
};
const f = (n, w = 6) => n.toFixed(1).padStart(w);

async function main() {
  const outdir = mkdtempSync(join(tmpdir(), 'sf-browser-bench-'));
  console.log('▸ bundling harness (esbuild, prod React)…');
  await build({
    entryPoints: [resolve('browser-bench/harness.tsx')],
    bundle: true,
    format: 'iife',
    outfile: join(outdir, 'bundle.js'),
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    jsx: 'automatic',
    logLevel: 'warning',
  });
  writeFileSync(
    join(outdir, 'index.html'),
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script src="./bundle.js"></script></body></html>',
  );

  console.log('▸ launching headless Chromium…');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning')
      console.log(`  [browser:${m.type()}]`, m.text());
  });
  page.on('pageerror', (e) => console.error('  [pageerror]', e.message));
  await page.goto('file://' + join(outdir, 'index.html'));
  await page.waitForFunction('window.__benchReady === true', {
    timeout: 30000,
  });

  // Per-mount hard timeout so a browser stall surfaces instead of hanging.
  const runMount = (mode, size) =>
    Promise.race([
      page.evaluate(([m, s]) => window.__benchMount(m, s), [mode, size]),
      new Promise((_, rej) =>
        setTimeout(
          () => rej(new Error(`evaluate timeout: ${mode} ${size}`)),
          30000,
        ),
      ),
    ]);

  const rows = [];
  for (const size of SIZES) {
    for (const mode of ['baseline', 'virtualized']) {
      for (let i = 0; i < WARMUP; i++) await runMount(mode, size);
      const mount = [];
      let last = {};
      for (let i = 0; i < SAMPLES; i++) {
        const r = await runMount(mode, size);
        if (r.capped)
          console.log(
            `  ⚠️ ${mode} ${size}: capped at 6s (inputs=${r.inputs})`,
          );
        mount.push(r.mountMs);
        last = r;
      }
      rows.push({
        size,
        mode,
        mountMed: median(mount),
        mountP95: p95(mount),
        inputs: last.inputs,
        deferred: last.deferred,
        domNodes: last.domNodes,
      });
    }
  }
  await browser.close();

  console.log(
    `\n=== Real-browser (headless Chromium, prod React) — median / p95 over ${SAMPLES} samples ===\n`,
  );
  console.log(
    '  size  mode          mount ms (med / p95)   inputs / deferred / domNodes',
  );
  for (const r of rows)
    console.log(
      `  ${String(r.size).padStart(4)}  ${r.mode.padEnd(12)}  ${f(r.mountMed)} / ${f(r.mountP95)}       ${String(r.inputs).padStart(4)} / ${String(r.deferred).padStart(5)} / ${String(r.domNodes).padStart(5)}`,
    );

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = resolve(`results/browser-${ts}.json`);
  writeFileSync(
    outPath,
    JSON.stringify({ ts, samples: SAMPLES, rows }, null, 2),
  );
  console.log(`\n💾 saved: ${outPath}\n done.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
