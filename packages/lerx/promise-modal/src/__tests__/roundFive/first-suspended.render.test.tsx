import { cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';

import { runFocusCase } from './helpers/runFocusCase';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

const rows = [
  { settlement: 'abort', focus: 'inside' },
  { settlement: 'abort', focus: 'body' },
  { settlement: 'abort', focus: 'outside' },
  { settlement: 'resolve', focus: 'inside' },
  { settlement: 'resolve', focus: 'body' },
  { settlement: 'resolve', focus: 'outside' },
  { settlement: 'cleanup', focus: 'inside' },
  { settlement: 'cleanup', focus: 'body' },
  { settlement: 'cleanup', focus: 'outside' },
] as const;
it.each(rows)(
  'first-suspended $settlement / $focus follows the displayed ownership rule',
  async ({ settlement, focus }) => {
    const shown = await runFocusCase(
      'shown',
      settlement,
      focus === 'inside' ? 'body' : focus,
    );
    const result = await runFocusCase('first-suspended', settlement, focus);
    expect(result).toEqual(shown);
  },
);
