import type { FormScenario } from '../types';

/** A sibling gate changes the committed shape in the same write. */
export const gatedShapeScenario = {
  name: 'settle.gated-shape',
  schema: { type: 'object', properties: {
    enabled: { type: 'boolean' },
    target: { type: 'string', controls: { active: '../enabled' } },
  } },
  initialValue: { enabled: false },
  steps: [
    { action: 'setValue', path: '/enabled', value: true,
      expect: { shape: { '/target': 'present' }, diagnostics: { status: 'stable' } } },
    { action: 'setValue', path: '/target', value: 'shown',
      expect: { outputValue: { enabled: true, target: 'shown' } } },
    { action: 'setValue', path: '/enabled', value: false,
      expect: { shape: { '/target': 'absent' }, outputValue: { enabled: false } } },
  ],
} satisfies FormScenario;
