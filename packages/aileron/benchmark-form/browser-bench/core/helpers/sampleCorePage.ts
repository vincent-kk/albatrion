import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'playwright';

import { getCoreFixture } from '../../../fixtures/core/getCoreFixture';
import type { CoreMeasurement } from '../types';
import { detectCoreFrameIntervalNominal } from './detectCoreFrameIntervalNominal';
import { selectCoreObservability } from './selectCoreObservability';

/**
 * Measure one fresh page with genuine keyboard input and a fixed hard deadline.
 * @param browser - Headless Chromium reused only as a process, never as a page.
 * @param bundles - Prepared bundle directory.
 * @param variant - Candidate, baseline, or the identical baseline control.
 * @param id - Valid core fixture identifier.
 * @returns Validated measurement; shape violations against the observability table and any page failure throw.
 */
export async function sampleCorePage(
  browser: Browser,
  bundles: string,
  variant: string,
  id: string,
): Promise<CoreMeasurement> {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const fixture = getCoreFixture(id);
  const row = selectCoreObservability(fixture);
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
    const names: (keyof typeof row.metrics)[] = [
      'blockingMs',
      'maxLongTaskMs',
      'firstWriteMs',
      'longTaskOverlapMs',
      'preFrameValidatorMs',
      'postFrameValidatorMs',
      'validatorSettledMs',
      'feedbackCommittedMs',
      'validationReportedMs',
      'longestFrameMs',
      'frameOverflowMs',
    ];
    for (const name of names) {
      const expectation = row.metrics[name];
      const value = result.metrics[name];
      if (expectation === 'null')
        assert.equal(value, null, `${name} is null for ${id}`);
      else if (expectation === 'number' || expectation === 'required')
        assert.ok(
          value !== null && Number.isFinite(value),
          `${name} is finite for ${id}`,
        );
      else
        assert.ok(
          value === null || Number.isFinite(value),
          `${name} is null or finite for ${id}`,
        );
    }
    assert.ok(
      detectCoreFrameIntervalNominal(result.metrics.frameIntervalMs) !== null &&
        detectCoreFrameIntervalNominal(result.metrics.frameIntervalMs) ===
          result.metrics.frameIntervalNominalMs,
      'Calibrated frame interval is a nominal 60 Hz or 120 Hz period',
    );
    for (const name of ['frameBudget60', 'frameBudget120'] as const) {
      const budget = result.metrics[name];
      assert.ok(
        Number.isFinite(budget.frameOverflowMs) && budget.frameOverflowMs >= 0,
        `${name} overflow is finite and nonnegative`,
      );
      assert.ok(
        Number.isInteger(budget.overBudgetFrames) &&
          budget.overBudgetFrames >= 0 &&
          budget.overBudgetFrames <= result.metrics.frames,
        `${name} count is bounded by observed gaps`,
      );
    }
    assert.equal(
      result.metrics.frameBudget60.frameOverflowMs,
      result.metrics.frameOverflowMs,
      'Primary overflow retains its meaning',
    );
    assert.equal(
      result.metrics.frameBudget60.overBudgetFrames,
      result.metrics.overBudgetFrames,
      'Primary count retains its meaning',
    );
    assert.ok(result.metrics.frames >= 2, 'At least two frames were observed');
    assert.equal(result.counts.failedCalls, 0, 'No validator call failed');
    assert.equal(
      result.counts.markers,
      row.markers,
      'Marker count matches the measured path',
    );
    if (row.lifetimeCompiles === 'zero')
      assert.equal(result.counts.lifetimeCompiles, 0, 'No compile for none');
    else
      assert.ok(
        result.counts.lifetimeCompiles >= 1,
        'Validate cases compile at least once',
      );
    if (row.validations === 'zero')
      assert.equal(result.counts.validations, 0, 'No validation for none');
    else
      assert.ok(
        result.counts.validations >= 1,
        'Validate cases run at least once',
      );
    return result;
  } finally {
    clearTimeout(deadline);
    await page.close();
  }
}
