import type { FormScenario } from '../types';

/** The children item policy clears an exiting target's retained raw. */
const childrenExitScenario = {
  name: 'controls.children-exit-policy-layer',
  schema: { type: 'object', controls: { children: [
    { targets: ['secret'], controls: { unsetOnInactive: true } },
  ] }, properties: {
    shown: { type: 'boolean' },
    secret: { type: 'string', controls: { active: '../shown' } },
  } },
  initialValue: { shown: true, secret: 'held' },
  steps: [
    { action: 'setValue', path: '/shown', value: false,
      expect: { shape: { '/secret': 'absent' }, outputValue: { shown: false } } },
    { action: 'setValue', path: '/shown', value: true,
      expect: { values: { '/secret': undefined }, outputValue: { shown: true } } },
  ],
} satisfies FormScenario;

/** A turning-off fragment still supplies its exit policy. */
const fragmentExitScenario = {
  name: 'controls.fragment-exit-policy-layer',
  schema: { type: 'object', properties: { shown: { type: 'boolean' } },
    allOf: [{ controls: { active: './shown', unsetOnInactive: true },
      properties: { secret: { type: 'string' } } }] },
  initialValue: { shown: true, secret: 'held' },
  steps: [
    { action: 'setValue', path: '/shown', value: false,
      expect: { shape: { '/secret': 'absent' }, outputValue: { shown: false } } },
    { action: 'setValue', path: '/shown', value: true,
      expect: { values: { '/secret': undefined }, outputValue: { shown: true } } },
  ],
} satisfies FormScenario;

/** An exit expression uses its value from the preceding live commit. */
const previousCommitExitScenario = {
  name: 'controls.expression-exit-previous-commit',
  schema: { type: 'object', properties: {
    shown: { type: 'boolean' },
    secret: { type: 'string', controls: {
      active: '../shown', unsetOnInactive: '../shown',
    } },
  } },
  initialValue: { shown: true, secret: 'held' },
  steps: [
    { action: 'setValue', path: '/shown', value: false,
      expect: { shape: { '/secret': 'absent' } } },
    { action: 'setValue', path: '/shown', value: true,
      expect: { values: { '/secret': undefined }, outputValue: { shown: true } } },
  ],
} satisfies FormScenario;

/** A hidden but active declaration retains its raw value. */
const visiblePreservesValueScenario = {
  name: 'controls.visible-preserves-value',
  schema: { type: 'object', properties: {
    secret: { type: 'string', controls: {
      visible: false, unsetOnInactive: true,
    } },
  } },
  initialValue: { secret: 'held' },
  steps: [{ action: 'setValue', path: '/secret', value: 'edited',
    expect: { states: { '/secret': { visible: false, enabled: false } },
      outputValue: { secret: 'edited' } } }],
} satisfies FormScenario;

export const exitLayerScenarios: readonly FormScenario[] = [
  childrenExitScenario, fragmentExitScenario, previousCommitExitScenario,
  visiblePreservesValueScenario,
];
