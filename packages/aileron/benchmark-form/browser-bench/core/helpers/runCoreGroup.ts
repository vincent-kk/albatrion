import type { Browser } from 'playwright';

import type { CoreMeasurement } from '../types';
import { sampleCorePage } from './sampleCorePage';

/**
 * Interleave fresh pages in balanced variant orders, discarding warmup pages.
 * @param browser - Browser process; every observation creates its own page.
 * @param bundles - Frozen production bundle directory.
 * @param id - Core case to exercise identically in every variant.
 * @param runs - Positive measured samples per variant.
 * @param warmup - Discarded samples per variant.
 * @param compare - Whether baseline and control variants participate.
 * @returns Complete measurements grouped by variant.
 */
export async function runCoreGroup(
  browser: Browser,
  bundles: string,
  id: string,
  runs: number,
  warmup: number,
  compare: boolean,
) {
  const samples: Record<
    'candidate' | 'baseline' | 'control',
    CoreMeasurement[]
  > = {
    candidate: [],
    baseline: [],
    control: [],
  };
  const orders: (keyof typeof samples)[][] = compare
    ? [
        ['baseline', 'candidate', 'control'],
        ['candidate', 'control', 'baseline'],
        ['control', 'baseline', 'candidate'],
        ['control', 'candidate', 'baseline'],
        ['baseline', 'control', 'candidate'],
        ['candidate', 'baseline', 'control'],
      ]
    : [['candidate']];
  for (let index = 0; index < warmup + runs; index++) {
    for (const variant of orders[index % orders.length]) {
      const sample = await sampleCorePage(browser, bundles, variant, id);
      if (index >= warmup) samples[variant].push(sample);
    }
  }
  return samples;
}
