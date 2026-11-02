import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'playwright';

import { getCoreFixture } from '../../../fixtures/core/getCoreFixture';
import type { CoreMeasurement } from '../types';

/**
 * Measure one fresh page with genuine keyboard input and a fixed hard deadline.
 * @param browser - Headless Chromium reused only as a process, never as a page.
 * @param bundles - Prepared bundle directory.
 * @param variant - Candidate, baseline, or the identical baseline control.
 * @param id - Valid core fixture identifier.
 * @returns Validated duration and DOM/write counts; any page failure throws.
 */
export async function sampleCorePage(
  browser: Browser,
  bundles: string,
  variant: string,
  id: string,
): Promise<CoreMeasurement> {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const fixture = getCoreFixture(id);
  const errors: string[] = [];
  const deadline = setTimeout(() => {
    void page.close();
  }, 60000);
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.exposeFunction('__coreFirstKey', async () => {
      await page.locator(`[id="${fixture.target}"]`).focus();
      await page.keyboard.type('a');
    });
    await page.exposeFunction('__coreType', async () => {
      await page.locator(`[id="${fixture.target}"]`).focus();
      for (let index = 0; index < 20; index++) {
        await page.keyboard.type(String.fromCharCode(97 + index));
        if (index < 19)
          await page.evaluate(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
          );
      }
    });
    await page.goto(pathToFileURL(join(bundles, variant, 'index.html')).href);
    await page.waitForFunction(() => Boolean(window.__core));
    await page.evaluate((caseId) => window.__core.prepare(caseId), id);
    const result = await page.evaluate(() => window.__core.run());
    assert.deepEqual(errors, [], 'No browser errors');
    assert.ok(
      Number.isFinite(result.durationMs) && result.durationMs >= 0,
      'Finite core duration',
    );
    assert.equal(
      result.counts.inputs,
      fixture.expectedInputs,
      'Complete form is mounted',
    );
    assert.equal(
      result.counts.writes,
      id.startsWith('type-') ? 20 : id.startsWith('first-key-') ? 1 : 0,
      'All real keys were observed',
    );
    return result;
  } finally {
    clearTimeout(deadline);
    await page.close();
  }
}
