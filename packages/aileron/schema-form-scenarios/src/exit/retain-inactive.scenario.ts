import type { FormScenario } from '../types';

/** An inactive field can retain its raw value for a later appearance. */
export const retainInactiveScenario = {
  name: 'exit.retain-inactive',
  schema: { type: 'object', properties: {
    enabled: { type: 'boolean' },
    secret: { type: 'string', controls: {
      active: '../enabled', unsetOnInactive: false,
    } },
  } },
  initialValue: { enabled: true, secret: 'held' },
  steps: [
    { action: 'setValue', path: '/enabled', value: false,
      expect: { shape: { '/secret': 'absent' }, outputValue: { enabled: false } } },
    { action: 'setValue', path: '/enabled', value: true,
      expect: { shape: { '/secret': 'present' }, values: { '/secret': 'held' },
        outputValue: { enabled: true, secret: 'held' } } },
  ],
} satisfies FormScenario;
