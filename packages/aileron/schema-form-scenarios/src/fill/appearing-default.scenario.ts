import type { FormScenario } from '../types';

/** A gated field receives its default when it first appears. */
export const appearingDefaultScenario = {
  name: 'fill.appearing-default',
  schema: { type: 'object', properties: {
    enabled: { type: 'boolean' },
    detail: { type: 'string', default: 'new', controls: { active: '../enabled' } },
  } },
  initialValue: { enabled: false },
  steps: [{ action: 'setValue', path: '/enabled', value: true,
    expect: { shape: { '/detail': 'present' }, values: { '/detail': 'new' },
      outputValue: { enabled: true, detail: 'new' } } }],
} satisfies FormScenario;
