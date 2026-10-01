import type { FormScenario } from '../types';

/** A parent item cannot unlock or reveal a conflicting local declaration. */
const combinationScenario = {
  name: 'controls.lock-or-visibility-and',
  schema: { type: 'object', controls: { children: [
    { targets: ['locked'], controls: { readOnly: true, disabled: false } },
    { targets: ['disabled'], controls: { readOnly: false, disabled: false } },
    { targets: ['hidden'], controls: { visible: false } },
  ] }, properties: {
    locked: { type: 'string', controls: { readOnly: false } },
    disabled: { type: 'string', controls: { disabled: true } },
    hidden: { type: 'string', controls: { visible: true } },
  } },
  initialValue: { locked: 'L', disabled: 'D', hidden: 'H' },
  steps: [{ action: 'setValue', path: '/locked', value: 'edited',
    expect: { states: {
      '/locked': { readOnly: true, disabled: false, visible: true, enabled: true },
      '/disabled': { readOnly: false, disabled: true, enabled: true },
      '/hidden': { visible: false, enabled: false },
    }, outputValue: { locked: 'edited', disabled: 'D', hidden: 'H' } } }],
} satisfies FormScenario;

/** Standard schema readOnly participates in local OR combination. */
const standardReadOnlyScenario = {
  name: 'controls.standard-read-only',
  schema: { type: 'object', properties: {
    field: { type: 'string', readOnly: true, controls: { readOnly: false } },
  } },
  initialValue: { field: 'before' },
  steps: [{ action: 'setValue', path: '/field', value: 'after',
    expect: { states: { '/field': { readOnly: true, enabled: true } },
      outputValue: { field: 'after' } } }],
} satisfies FormScenario;

/** A children item evaluates against its host for every addressed target. */
const childrenExpressionScenario = {
  name: 'controls.children-host-expression',
  schema: { type: 'object', controls: { children: [
    { targets: ['a', 'b'], controls: { disabled: './lock' } },
  ] }, properties: {
    lock: { type: 'boolean' }, a: { type: 'string' }, b: { type: 'string' },
  } },
  initialValue: { lock: false, a: 'A', b: 'B' },
  steps: [
    { action: 'setValue', path: '/lock', value: true,
      expect: { states: { '/a': { disabled: true }, '/b': { disabled: true } } } },
    { action: 'setValue', path: '/lock', value: false,
      expect: { states: { '/a': { disabled: false }, '/b': { disabled: false } } } },
  ],
} satisfies FormScenario;

export const stateScenarios: readonly FormScenario[] = [
  combinationScenario, standardReadOnlyScenario, childrenExpressionScenario,
];
