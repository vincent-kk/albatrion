// Loaded by bench:probe through tsx; bundles frameProbeHarness.ts, serves it cross-origin isolated in headless Chromium and prints PROBE_FRAMES_OK.
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { checkCoreFrameProbe } from './utils/checkCoreFrameProbe';

/** Routed secure origin; COOP/COEP headers enable precise performance.now readings. */
const ORIGIN = 'https://core-frame-probe.invalid';

/** Source directory resolving the probe's entry and HTML fixture. */
const here = fileURLToPath(new URL('.', import.meta.url));
/** Disposable bundle output removed on either success or probe failure. */
const directory = mkdtempSync(join(tmpdir(), 'core-frame-probe-'));
try {
  await build({
    entryPoints: [join(here, 'frameProbeHarness.ts')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    outfile: join(directory, 'probe.js'),
    logLevel: 'warning',
  });
  const files: Record<string, { body: Buffer; contentType: string }> = {
    '/': {
      body: readFileSync(join(here, 'frameProbe.html')),
      contentType: 'text/html',
    },
    '/probe.js': {
      body: readFileSync(join(directory, 'probe.js')),
      contentType: 'text/javascript',
    },
  };
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route(`${ORIGIN}/**`, (route) => {
      const file = files[new URL(route.request().url()).pathname];
      if (!file) return route.fulfill({ status: 404 });
      return route.fulfill({
        status: 200,
        body: file.body,
        contentType: file.contentType,
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      });
    });
    await page.goto(`${ORIGIN}/`);
    const result = await page.evaluate(() => window.__probe.run());
    console.log(JSON.stringify(result, null, 2));
    const failures = [
      ...checkCoreFrameProbe(result),
      ...errors.map((message) => `page error: ${message}`),
    ];
    for (const failure of failures) console.log(failure);
    console.log(
      `PROBE_OVERHEAD raw=${result.idleOverheadMsPerSecond.toFixed(3)} floor=${result.idleFloorMsPerSecond.toFixed(3)} net=${result.idleNetOverheadMsPerSecond.toFixed(3)} ms/s; raw <= 2.5, floor <= 2.5, net <= 1`,
    );
    console.log(failures.length ? 'PROBE_FRAMES_FAILED' : 'PROBE_FRAMES_OK');
    process.exitCode = failures.length ? 1 : 0;
  } finally {
    await browser.close();
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
