import type { FormScenario } from '../types';

/** A departing field with unsetOnInactive discards its retained raw value. */
export const unsetInactiveScenario = {
  name: 'exit.unset-inactive',
  schema: { type: 'object', properties: {
    enabled: { type: 'boolean' },
    secret: { type: 'string', controls: {
      active: '../enabled', unsetOnInactive: true,
    } },
  } },
  initialValue: { enabled: true, secret: 'held' },
  steps: [
    { action: 'setValue', path: '/enabled', value: false,
      expect: { shape: { '/secret': 'absent' }, outputValue: { enabled: false } } },
    { action: 'setValue', path: '/enabled', value: true,
      expect: { shape: { '/secret': 'present' }, values: { '/secret': undefined },
        outputValue: { enabled: true } } },
  ],
} satisfies FormScenario;
