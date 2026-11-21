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
  'hidden $settlement / $focus follows the displayed ownership rule',
  async ({ settlement, focus }) => {
    expect((await runFocusCase('shown', settlement, focus)).isolated).toBe(
      true,
    );
    const result = await runFocusCase('hidden', settlement, focus);
    expect(result.isolated).toBe(false);
    expect(result.restored).toBe(false);
    expect(result.preserved).toBe(true);
  },
);
