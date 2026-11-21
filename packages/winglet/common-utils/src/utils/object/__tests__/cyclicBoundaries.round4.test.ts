import { runInNewContext } from 'node:vm';

import { expect, it } from 'vitest';

import { cloneLite } from '../cloneLite';
import { equals } from '../equals/equals';

function makeCycle() {
  const input: { leaf: number; next: unknown } = { leaf: 1, next: null };
  input.next = input;
  return input;
}

it('cloneLite rejects an unbounded cycle within the watchdog', () => {
  const copy = () => cloneLite(makeCycle());
  expect(() => runInNewContext('copy()', { copy }, { timeout: 250 })).toThrow(
    RangeError,
  );
});

it('equals rejects a repeated active comparison within the watchdog', () => {
  const compare = () => equals(makeCycle(), makeCycle());
  expect(() =>
    runInNewContext('compare()', { compare }, { timeout: 250 }),
  ).toThrow(RangeError);
});

it('equals can revisit the same left object with a different right object', () => {
  type Link = { leaf: number; next: Link | null };
  const tail: Link = { leaf: 1, next: null };
  const head: Link = { leaf: 1, next: tail };
  const compare = () => equals(makeCycle(), head);
  expect(compare()).toBe(false);
  tail.next = head;
  expect(() =>
    runInNewContext('compare()', { compare }, { timeout: 250 }),
  ).toThrow(RangeError);
});

it('a shared descendant is not a back edge in either traversal', () => {
  const leaf = { value: 1 };
  const input = { first: leaf, second: leaf };
  const otherLeaf = { value: 1 };
  const other = { first: otherLeaf, second: otherLeaf };
  expect(equals(input, other)).toBe(true);

  let deep: unknown = input;
  for (let depth = 0; depth < 300; depth++) deep = { next: deep };
  expect(equals(cloneLite(deep), deep)).toBe(true);
});
