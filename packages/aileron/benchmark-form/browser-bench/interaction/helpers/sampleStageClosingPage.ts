import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'playwright';

import { getStageClosingFixture } from '../../../fixtures/input-responsiveness/getStageClosingFixture';
import type { StageClosingPage } from '../stageClosingTypes';

/** Send real keys or the frame-driven stream while preserving misses as gate evidence. */
export async function sampleStageClosingPage(
  browser: Browser,
  root: string,
  lane: string,
  id: string,
): Promise<StageClosingPage> {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors: string[] = [];
  const fixture = getStageClosingFixture(id);
  let initial = '',
    typed = '';
  let firstKeyDone: () => void = () => {
    throw new Error('First key callback missing');
  };
  let firstKeyFailed: (error: unknown) => void = () => {
    throw new Error('First key failure callback missing');
  };
  const firstKey = new Promise<void>((resolve, reject) => {
    firstKeyDone = resolve;
    firstKeyFailed = reject;
  });
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    if (fixture.firstKey)
      await page.exposeFunction('__ir6FirstKey', async () => {
        try {
          const target = page.locator(`[id="${fixture.target}"]`);
          await target.focus();
          initial = await target.inputValue();
          await target.evaluate((element) => {
            if (!(element instanceof HTMLInputElement))
              throw new Error('Expected string input');
            const input = element;
            input.setSelectionRange(input.value.length, input.value.length);
          });
          await page.keyboard.type('a');
          typed = 'a';
          firstKeyDone();
        } catch (error) {
          firstKeyFailed(error);
        }
      });
    await page.goto(pathToFileURL(path.join(root, lane, 'index.html')).href);
    await page.waitForFunction(() => !!window.__ir6);
    await page.evaluate((name) => window.__ir6.prepare(name), id);
    if (fixture.firstKey) await firstKey;
    else {
      const target = page.locator(`[id="${fixture.target}"]`);
      if (!fixture.mount && !fixture.streamFrames && !fixture.operation) {
        initial = await target.inputValue();
        await target.focus();
        await target.press('End');
      }
      await page.evaluate(() => window.__ir6.begin());
      if (fixture.operation)
        await page.evaluate(() => window.__closing.operate());
      else if (fixture.streamFrames)
        await page.evaluate(() => window.__ir6.stream());
      else if (!fixture.mount)
        for (let index = 0; index < 20; index++) {
          const key = String.fromCharCode(97 + index);
          await page.keyboard.type(key);
          typed += key;
          if (fixture.intervalMs && index < 19)
            await page.evaluate(() => window.__ir6.waitForNextKey());
        }
    }
    const record = await page.evaluate(() => window.__closing.finish());
    assert.deepEqual(errors, [], 'No browser error');
    assert.equal(record.mount.allDeferred, 0);
    assert.equal(record.final.inputs, fixture.expectedInputs);
    assert.ok(
      Number.isFinite(record.mount.firstPaintedMs),
      'First-paint observer completed',
    );
    assert.ok(
      record.handlers.every(
        (handler) => handler.trusted && Number.isFinite(handler.wallMs),
      ),
    );
    if (!fixture.mount && !fixture.streamFrames && !fixture.operation) {
      assert.equal(record.handlers.length, fixture.firstKey ? 1 : 20);
      assert.equal(record.final.targetValue, initial + typed);
      assert.equal(
        await page.locator(`[id="${fixture.target}"]`).inputValue(),
        initial + typed,
      );
    }
    if (fixture.streamFrames) {
      assert.equal(record.stream?.writeFrames, 60);
      assert.equal(record.stream?.scriptMs.length, 60);
      assert.equal(record.final.targetValue, 'a'.repeat(60));
    }
    if (fixture.operation) {
      assert.equal(record.closing.operations.length, 10);
      for (const operation of record.closing.operations) {
        assert.equal(operation.nodeChanged, operation.expectedNodeChanged);
        assert.ok(Number.isFinite(operation.callDuration));
        assert.ok(Number.isFinite(operation.nextPainted));
        assert.ok(Number.isFinite(operation.postPaintBusy));
        if (fixture.operation === 'validate')
          assert.ok(Number.isFinite(operation.resolutionTime));
      }
    }
    assert.ok(Number.isFinite(record.closing.mountPostPaintBusy));
    return record;
  } finally {
    await page.close();
  }
}
