import { afterEach, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ModalManager } from '@/promise-modal/app';
import { runFocusCase } from './helpers/runFocusCase';

afterEach(() => { cleanup(); ModalManager.reset(); });

const rows = ['abort', 'resolve', 'cleanup'].flatMap((settlement) => ['inside', 'body', 'outside'].map((focus) => ({ settlement, focus })));
it.each(rows)('first-suspended $settlement / $focus follows the displayed ownership rule', async ({settlement, focus}) => {
  if (settlement !== 'abort' && settlement !== 'resolve' && settlement !== 'cleanup') throw new Error('Unknown settlement');
  if (focus !== 'inside' && focus !== 'body' && focus !== 'outside') throw new Error('Unknown focus');
  const shown = await runFocusCase('shown', settlement, focus === 'inside' ? 'body' : focus);
  const result = await runFocusCase('first-suspended', settlement, focus);
  expect(result).toEqual(shown);
});
