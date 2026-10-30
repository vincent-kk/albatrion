import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'playwright';

import type { PageRecord } from '../types';

/**
 * Exercise one fresh page with real keyboard events and validate observable fixture completion.
 * @param browser - Shared headless Chromium process
 * @param root - Frozen bundle directory
 * @param lane - Product lane loaded once in this fresh page
 * @param id - Browser fixture id
 * @returns Every page observation plus uninstrumented assertions of completed work
 * @throws On a page error, missing real events, lost text, incomplete mount or wrong branch
 */
export async function samplePage(
  browser: Browser,
  root: string,
  lane: string,
  id: string,
): Promise<PageRecord> {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.join(root, lane, 'index.html')).href);
    await page.waitForFunction(() => !!window.__ir0);
    const fixture = await page.evaluate((id) => window.__ir0.prepare(id), id);
    const initialCounter = await page.locator('#parent-counter').textContent();
    const target = page.locator(`[id="${fixture.target}"]`);
    const initial = fixture.mount ? '' : await target.inputValue();
    if (!fixture.mount) {
      await target.focus();
      if (id !== 'switch-oneOf-20') await target.press('End');
    }
    await page.evaluate(() => window.__ir0.begin());
    let typed = '';
    if (id === 'switch-oneOf-20') {
      for (let index = 0; index < 10; index++)
        await target.selectOption(index % 2 === 0 ? 'kind_19' : 'kind_0');
    } else if (!fixture.mount) {
      const count = id === 'replace-200-while-typing' ? 10 : 20;
      for (let index = 0; index < count; index++) {
        if (index === 5 && id === 'replace-200-while-typing')
          await page.evaluate(() => window.__ir0.replace());
        const before = Date.now();
        const key = String.fromCharCode(97 + (index % 26));
        await page.keyboard.type(key);
        typed += key;
        if (fixture.intervalMs && index + 1 < count)
          await page.waitForTimeout(
            Math.max(0, fixture.intervalMs - (Date.now() - before)),
          );
      }
    }
    const record = await page.evaluate(() => window.__ir0.finish());
    assert.deepEqual(errors, [], 'No browser errors');
    assert.equal(record.mount.allDeferred, 0);
    if (!fixture.mount && id !== 'switch-oneOf-20') {
      assert.equal(
        record.handlers.filter((event) => event.type === 'input').length,
        typed.length,
        'Every key dispatched one input event',
      );
      assert.equal(
        record.final.targetValue,
        initial + typed,
        'No dropped or reordered input',
      );
      assert.equal(
        await target.inputValue(),
        initial + typed,
        'DOM retains the complete typed value',
      );
    }
    if (id !== 'switch-oneOf-20')
      assert.ok(
        record.handlers.every((event) => event.trusted),
        'All keyboard input events are trusted',
      );
    if (id === 'replace-200-while-typing')
      assert.equal(record.final.inputs, 601);
    if (id === 'switch-oneOf-20') {
      assert.equal(record.handlers.length, 10);
      assert.equal(record.final.targetValue, 'kind_0');
      assert.ok(record.final.branch?.includes('payload_0_a'));
      assert.ok(!record.final.branch?.includes('payload_19_a'));
    }
    if (fixture.parentState)
      assert.ok(
        record.final.counter > Number(initialCounter),
        `${id}/${lane}: onChange counter ${initialCounter} -> ${record.final.counter}`,
      );
    if (id.endsWith('-nonburst'))
      assert.equal(
        record.handlers.filter((handler) =>
          record.validations.some(
            (value) => value.sequence === handler.sequence,
          ),
        ).length,
        20,
        'Non-burst validator delivers every changed verdict',
      );
    return record;
  } finally {
    await page.close();
  }
}
