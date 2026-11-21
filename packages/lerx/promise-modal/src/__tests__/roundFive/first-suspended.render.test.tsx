import { cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';

import { runFocusCase } from './helpers/runFocusCase';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

const rows = [
  {
    settlement: 'abort',
    focus: 'inside',
    unavailable: 'no inside control exists before the first suspension',
  },
  { settlement: 'abort', focus: 'body' },
  { settlement: 'abort', focus: 'outside' },
  {
    settlement: 'resolve',
    focus: 'inside',
    unavailable: 'no inside control exists before the first suspension',
  },
  { settlement: 'resolve', focus: 'body' },
  { settlement: 'resolve', focus: 'outside' },
  {
    settlement: 'cleanup',
    focus: 'inside',
    unavailable: 'no inside control exists before the first suspension',
  },
  { settlement: 'cleanup', focus: 'body' },
  { settlement: 'cleanup', focus: 'outside' },
] as const;
for (const row of rows) {
  const { settlement, focus } = row;
  it.skipIf('unavailable' in row)(
    `first-suspended ${settlement} / ${focus}${'unavailable' in row ? ': ' + row.unavailable : ''}`,
    async () => {
      const shown = await runFocusCase('shown', settlement, focus);
      const result = await runFocusCase('first-suspended', settlement, focus);
      expect(result).toEqual(shown);
    },
  );
}
