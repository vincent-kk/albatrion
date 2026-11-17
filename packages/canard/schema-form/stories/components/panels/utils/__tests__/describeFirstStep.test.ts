import { compositeCases, compositionFeatureScenarios } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import { describeFirstStep } from '../describeFirstStep';

describe('describeFirstStep', () => {
  it('describes the first value edit without tab instructions', () => {
    expect(describeFirstStep([{ action: 'setValue', path: '/age', value: 15 }, { action: 'reset' }]))
      .toBe('Set /age to 15, then watch Value and Errors.');
  });
  it('serializes structured field values for display', () => {
    expect(describeFirstStep([{ action: 'setValue', path: '/profile', value: { name: 'Ada' } }]))
      .toBe('Set /profile to {"name":"Ada"}, then watch Value and Errors.');
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
  it('skips the real if-then-else observation batch without changing its steps', () => {
    const steps = compositionFeatureScenarios.find(({ name }) => name === 'composition.if-then-else-guard')!.steps;
    const before = JSON.stringify(steps);
    expect(describeFirstStep(steps)).toBe('Set /license to "B2", then watch Value and Errors.');
    expect(JSON.stringify(steps)).toBe(before);
  });
  it('keeps the fallback for the real observation-only cx15 scenario', () => {
    const steps = compositeCases.find(({ scenario }) => scenario.name === 'composite.cx15-external-and-validation-errors')!.scenario.steps;
    expect(describeFirstStep(steps)).toBe('Edit the fields and watch Value and Errors.');
  });
  it('descends nested batches past empty observations to the first operation', () => {
    expect(describeFirstStep([
      { expect: { value: 1 } },
      { action: 'batch', steps: [{ action: 'batch', steps: [] }, { action: 'batch', steps: [{ action: 'clear', path: '/name' }] }] },
      { action: 'submit' },
    ])).toBe('Clear /name, then watch Value and Errors.');
  });
  it('continues after an observation-only nested batch', () => {
    expect(describeFirstStep([{ action: 'batch', steps: [{ action: 'batch', steps: [] }] }, { action: 'reset' }]))
      .toBe('Reset the form, then watch Value and Errors.');
  });
  it('describes adding a supplied value or a default array item', () => {
    expect(describeFirstStep([{ action: 'push', path: '/rows', value: { title: 'New' } }]))
      .toBe('Add {"title":"New"} to /rows, then watch Value and Errors.');
    expect(describeFirstStep([{ action: 'push', path: '/rows' }]))
      .toBe('Add an item to /rows, then watch Value and Errors.');
  });
  it('describes removing an item using a one-based position', () => {
    expect(describeFirstStep([{ action: 'remove', path: '/rows', index: 0 }]))
      .toBe('Remove item 1 from /rows, then watch Value and Errors.');
  });
  it('describes updating an array item', () => {
    expect(describeFirstStep([{ action: 'update', path: '/rows', index: 1, value: 'Updated' }]))
      .toBe('Set item 2 in /rows to "Updated", then watch Value and Errors.');
  });
  it('describes popping an item and resetting a subtree', () => {
    expect(describeFirstStep([{ action: 'pop', path: '/rows' }]))
      .toBe('Remove the last item from /rows, then watch Value and Errors.');
    expect(describeFirstStep([{ action: 'resetSubtree', path: '/profile' }]))
      .toBe('Reset /profile, then watch Value and Errors.');
  });

});
