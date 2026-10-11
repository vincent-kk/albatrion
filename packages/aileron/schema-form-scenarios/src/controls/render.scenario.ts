import type { FormScenario } from '../types';

/** Presentation and virtual children remain observable through the shared screen path. */
export const controlsRenderScenarios: readonly FormScenario[] = [
  {
    name: 'controls.empty-default-inputs',
    description: 'schema-props-renderer: LANDING-034 presentation namespace; LANDING-196 empty primitive inputs write undefined.',
    schema: { type: 'object', options: { omitEmpty: false }, properties: {
      name: { type: 'string', presentation: { FormTypeInputProps: { placeholder: 'Enter name', className: 'named-input' } } },
      count: { type: 'number', presentation: { FormTypeInputProps: { placeholder: 'Enter count' } } },
    } }, initialValue: { name: 'loaded', count: 2 },
    steps: [
      { action: 'clear', path: '/name', expect: { values: { '/name': undefined }, outputValue: { count: 2 } } },
      { action: 'clear', path: '/count', expect: { values: { '/count': undefined }, outputValue: {} } },
    ],
  },
  {
    name: 'controls.virtual-branch-round-trip',
    description: 'virtual.render: LANDING-167 virtual uses branch ChildNodeComponents; LANDING-018 inactive raw survives.',
    schema: { type: 'object', properties: {
      shown: { type: 'boolean' },
      name: { type: 'string', controls: { active: '../shown' } },
    }, options: { virtual: { group: { fields: ['name'], controls: { active: './shown' } } } } }, initialValue: { shown: true, name: 'loaded' },
    steps: [
      { action: 'setValue', path: '', value: { shown: true, name: 'whole' }, expect: { shape: { '/name': 'present' }, outputValue: { shown: true, name: 'whole' } } },
      { action: 'setValue', path: '/shown', value: false, expect: { shape: { '/group': 'absent' }, outputValue: { shown: false } } },
      { action: 'setValue', path: '/shown', value: true, expect: { shape: { '/name': 'present' }, values: { '/name': 'whole' } } },
    ],
  },
];
