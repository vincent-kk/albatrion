import type { FormScenario } from '../types';

/** SETTLE-020·045: a sibling gate observes latent child exits and reentries. */
export const presenceReadersScenario = {
  name: 'exit.presence-readers',
  description: 'SETTLE-020·045, CONTROLS-080: emitted presence re-evaluates sibling readers',
  schema: { type: 'object', properties: {
    h: { type: 'object', properties: {
      t: { type: 'string', default: 'on' },
      m: { type: 'string', default: 'M', controls: { active: "../t === 'on'" } },
      c: { type: 'string', controls: { active: "../m !== 'M'" } },
    } },
    z: { type: 'string', controls: { active: "../h/c === 'x'" } },
  } },
  initialValue: { h: { t: 'on', c: 'x' } },
  steps: [
    { action: 'setValue', path: '/h/t', value: 'off', expect: {
      shape: { '/h/c': 'present', '/h/m': 'absent', '/z': 'present' },
      outputValue: { h: { t: 'off', c: 'x' }, z: undefined },
    } },
    { action: 'setValue', path: '/h/t', value: 'on', expect: {
      shape: { '/h/c': 'absent', '/h/m': 'present', '/z': 'absent' },
      outputValue: { h: { t: 'on', m: 'M' } },
    } },
  ],
} satisfies FormScenario;
