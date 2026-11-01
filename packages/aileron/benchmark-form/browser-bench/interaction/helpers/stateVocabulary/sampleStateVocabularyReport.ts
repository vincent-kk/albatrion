import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'playwright';

import type { StateVocabularyReport } from './reportTypes';

/** Sample a fresh report page; heap collection uses CDP without taking a heap snapshot. */
export async function sampleStateVocabularyReport(
  browser: Browser,
  root: string,
  lane: string,
  id: string,
  index: number,
): Promise<StateVocabularyReport> {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.join(root, lane, 'report.html')).href);
    await page.evaluate(() => window.__svReport.prepare());
    const edits = id === 'is-divergent-flat-2000' ? 1 : 100;
    await page.evaluate((count) => window.__svReport.edit(count), edits);
    if (id === 'is-divergent-flat-2000') {
      const read = await page.evaluate(() => window.__svReport.read());
      assert.deepEqual(errors, []);
      return { id, lane, index, edits, read };
    }
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('HeapProfiler.collectGarbage');
    const heap = await cdp.send('Runtime.getHeapUsage');
    await cdp.detach();
    assert.deepEqual(errors, []);
    return { id, lane, index, edits, heap };
  } finally {
    await page.close();
  }
}
