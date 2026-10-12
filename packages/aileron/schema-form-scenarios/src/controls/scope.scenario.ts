import type { FormScenario } from '../types';

/** Fragment state reaches declarations inside the fragment only. */
const fragmentScopeScenario = {
  name: 'controls.fragment-scope',
  schema: { type: 'object', properties: {
    outside: { type: 'string' },
  }, allOf: [{ controls: { visible: false, readOnly: true }, properties: {
    inside: { type: 'string' },
  } }] },
  initialValue: { inside: 'I', outside: 'O' },
  steps: [{ action: 'setValue', path: '/outside', value: 'edited',
    expect: { states: {
      '/inside': { visible: false, enabled: false, readOnly: true },
      '/outside': { visible: true, enabled: true, readOnly: false },
    }, outputValue: { inside: 'I', outside: 'edited' } } }],
} satisfies FormScenario;

/** The root's local state keys do not pass to child nodes. */
const rootLocalScenario = {
  name: 'controls.root-keys-do-not-inherit',
  schema: { type: 'object', readOnly: true,
    controls: { disabled: true, visible: false }, properties: {
      child: { type: 'string' },
    } },
  initialValue: { child: 'C' },
  steps: [{ action: 'setValue', path: '/child', value: 'edited',
    expect: { states: {
      '': { readOnly: true, disabled: true, visible: false, enabled: false },
      '/child': { readOnly: false, disabled: false, visible: true, enabled: true },
    }, outputValue: { child: 'edited' } } }],
} satisfies FormScenario;

/** A children item value key overrides the ordinary default. */
const childrenValueLayerScenario = {
  name: 'controls.children-value-layer',
  schema: { type: 'object', controls: { children: [
    { targets: ['field'], controls: { default: 'item' } },
  ] }, properties: { field: { type: 'string', default: 'ordinary' } } },
  initialValue: {},
  steps: [{ action: 'reset', expect: { values: { '/field': 'item' },
    outputValue: { field: 'item' } } }],
} satisfies FormScenario;

export const scopeScenarios: readonly FormScenario[] = [
  fragmentScopeScenario, rootLocalScenario, childrenValueLayerScenario,
];
