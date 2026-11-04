import { describe, expect, it } from 'vitest';

import { describeFirstStep } from '../describeFirstStep';

describe('describeFirstStep', () => {
  it('describes the first value edit without tab instructions', () => {
    expect(describeFirstStep([{ action: 'setValue', path: '/age', value: 15 }, { action: 'reset' }]))
      .toBe('Set /age to 15, then watch Value and Errors.');
  });
  it('names the root and serializes structured values for display', () => {
    expect(describeFirstStep([{ action: 'setValue', path: '', value: { name: 'Ada' } }]))
      .toBe('Set the form to {"name":"Ada"}, then watch Value and Errors.');
  });
  it('describes clearing a field', () => {
    expect(describeFirstStep([{ action: 'clear', path: '/name' }]))
      .toBe('Clear /name, then watch Value and Errors.');
  });
  it('describes submitting the form', () => {
    expect(describeFirstStep([{ action: 'submit' }])).toBe('Submit the form, then watch Value and Errors.');
  });
  it('describes resetting the form', () => {
    expect(describeFirstStep([{ action: 'reset' }])).toBe('Reset the form, then watch Value and Errors.');
  });
  it('falls back for empty or unknown operations', () => {
    const fallback = 'Edit the fields and watch Value and Errors.';
    expect(describeFirstStep([])).toBe(fallback);
    expect(describeFirstStep([{ action: 'unknown' }])).toBe(fallback);
    expect(describeFirstStep([{ action: 'setValue' }])).toBe(fallback);
  });
});
