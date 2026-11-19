import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { cloneLite } from '../cloneLite';

it.each([1, 2, 300])('round-4 cycles terminate with RangeError at depth %s', depth => {
  const make = () => {
    const root: Record<string, unknown> = {};
    let tail = root;
    for (let index = 1; index < depth; index++) { const next = {}; tail.next = next; tail = next; }
    tail.next = root;
    return root;
  };
  let result = 'returned';
  try { runInNewContext('call()', { call: () => cloneLite(make()) }, { timeout: 500 }); }
  catch (error) { result = error instanceof RangeError ? 'RangeError' : String(error); }
  expect(result).toBe('RangeError');
});
