import { describe, expect, it } from 'vitest';

import { describeStep } from '../describeStep';

describe('describeStep', () => {
  it('describes field operations with their path and display value', () => {
    expect(describeStep({ action: 'setValue', path: '/age', value: 15 })).toBe('Set /age to 15');
    expect(describeStep({ action: 'clear', path: '/name' })).toBe('Clear /name');
    expect(describeStep({ action: 'resetSubtree', path: '/profile' })).toBe('Reset /profile');
  });
  it('reads the root path as the whole value', () => {
    expect(describeStep({ action: 'setValue', path: '', value: { a: 1 } })).toBe('Set the whole value to {"a":1}');
  });
  it('describes array operations with one-based positions', () => {
    expect(describeStep({ action: 'push', path: '/rows' })).toBe('Add an item to /rows');
    expect(describeStep({ action: 'push', path: '/rows', value: [undefined] })).toBe('Add [null] to /rows');
    expect(describeStep({ action: 'pop', path: '/rows' })).toBe('Remove the last item from /rows');
    expect(describeStep({ action: 'remove', path: '/rows', index: 0 })).toBe('Remove item 1 from /rows');
    expect(describeStep({ action: 'update', path: '/rows', index: 1, value: 'x' })).toBe('Set item 2 in /rows to "x"');
  });
  it('describes form commands, including a reset without automatic writes', () => {
    expect(describeStep({ action: 'submit' })).toBe('Submit the form');
    expect(describeStep({ action: 'reset' })).toBe('Reset the form');
    expect(describeStep({ action: 'reset', automaticWrites: 'disabled' })).toBe('Reset the form without automatic writes');
  });
  it('counts the operations of a batch', () => {
    expect(describeStep({ action: 'batch', steps: [{ action: 'submit' }] })).toBe('Run 1 operation in one batch');
    expect(describeStep({ action: 'batch', steps: [{}, {}] })).toBe('Run 2 operations in one batch');
  });
  it('returns undefined for observation-only records, unknown actions and missing fields', () => {
    expect(describeStep({ expect: { outputValue: 1 } })).toBeUndefined();
    expect(describeStep({ action: 'batch', steps: [], expect: { outputValue: 1 } })).toBeUndefined();
    expect(describeStep({ action: 'unknown', path: '/a' })).toBeUndefined();
    expect(describeStep({ action: 'setValue', path: '/a' })).toBeUndefined();
    expect(describeStep({ action: 'remove', path: '/rows' })).toBeUndefined();
  });
});
