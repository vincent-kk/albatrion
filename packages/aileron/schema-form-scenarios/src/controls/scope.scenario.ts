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
      '/inside': { isVisible: false, isPresent: false, isReadOnly: true },
      '/outside': { isVisible: true, isPresent: true, isReadOnly: false },
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
      '': { isReadOnly: true, isDisabled: true, isVisible: false, isPresent: false },
      '/child': { isReadOnly: false, isDisabled: false, isVisible: true, isPresent: true },
    }, outputValue: { child: 'edited' } } }],
} satisfies FormScenario;

/** A fields entry value key overrides the ordinary default. */
const childrenValueLayerScenario = {
  name: 'controls.fields-value-layer',
  schema: { type: 'object', controls: { fields: [
    { targets: ['field'], controls: { default: 'item' } },
  ] }, properties: { field: { type: 'string', default: 'ordinary' } } },
  initialValue: {},
  steps: [{ action: 'reset', expect: { values: { '/field': 'item' },
    outputValue: { field: 'item' } } }],
} satisfies FormScenario;

export const scopeScenarios: readonly FormScenario[] = [
  fragmentScopeScenario, rootLocalScenario, childrenValueLayerScenario,
];
