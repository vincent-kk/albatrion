import * as React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ModalManager } from '@/promise-modal/app';
import { runFocusCase } from './helpers/runFocusCase';

afterEach(() => { cleanup(); ModalManager.reset(); });

const rows = ['abort', 'resolve', 'cleanup'].flatMap((settlement) => ['inside', 'body', 'outside'].map((focus) => ({ settlement, focus })));
it.skipIf(!React.Activity).each(rows)('activity $settlement / $focus follows the displayed ownership rule', async ({settlement, focus}) => {
  if (settlement !== 'abort' && settlement !== 'resolve' && settlement !== 'cleanup') throw new Error('Unknown settlement');
  if (focus !== 'inside' && focus !== 'body' && focus !== 'outside') throw new Error('Unknown focus');
  expect((await runFocusCase('shown', settlement, focus === 'inside' ? 'body' : focus)).isolated).toBe(true);
  const result = await runFocusCase('activity', settlement, focus);
  expect(result.isolated).toBe(false);
  expect(result.restored).toBe(false);
  expect(result.preserved).toBe(true);
});
