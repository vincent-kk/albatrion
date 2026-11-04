import { describe, expect, it } from 'vitest';

import { describeFirstStep } from '../describeFirstStep';

describe('describeFirstStep root writes', () => {
  it('falls back when the only write targets the root', () => {
    expect(describeFirstStep([{ action: 'setValue', path: '', value: [undefined, 'x', undefined] }]))
      .toBe('Edit the fields and watch Value and Errors.');
  });
  it('skips root writes inside batches and finds the first field operation', () => {
    expect(describeFirstStep([
      { action: 'batch', steps: [{ action: 'setValue', path: '', value: {} }] },
      { action: 'clear', path: '/name' },
    ])).toBe('Clear /name, then watch Value and Errors.');
  });
  it('displays undefined array items as null without changing the source', () => {
    const value = Object.freeze([undefined, 'x', undefined]);
    expect(describeFirstStep([{ action: 'setValue', path: '/rows', value }]))
      .toBe('Set /rows to [null,"x",null], then watch Value and Errors.');
    expect(value[0]).toBeUndefined();
  });
  it('displays sparse and nested array slots as null', () => {
    const value = new Array(2);
    value[1] = [undefined, 'x'];
    expect(describeFirstStep([{ action: 'push', path: '/rows', value }]))
      .toBe('Add [null,[null,"x"]] to /rows, then watch Value and Errors.');
  });
});
