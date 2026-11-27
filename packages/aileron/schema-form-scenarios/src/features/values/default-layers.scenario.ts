import type { FormScenario } from '../../types';

/** Fill sources on one form: controls.default, schema default, a host object default, and the caller's value. */
const layersSchema = {
  type: 'object',
  properties: {
    plain: { type: 'string', default: 'schema-plain' },
    ranked: { type: 'string', default: 'schema-ranked', controls: { default: 'controls-ranked' } },
    given: { type: 'string', default: 'schema-given' },
    profile: {
      type: 'object', default: { nick: 'host-nick' },
      properties: { nick: { type: 'string', default: 'child-nick' }, tier: { type: 'string', default: 'basic' } },
    },
  },
};

/** Fill happens only when nodes are created: on load, reset, and resetSubtree; writes never refill. */
export const defaultLayersScenario: FormScenario = {
  name: 'values.default-layers',
  description: 'CONTROLS-025 controls.default precedes default; SCHEMA-002 fill on node creation; LANDING-144 a loaded {} does not block a host default; WRITE-090 fill only on load, reset, and resetSubtree, never on setValue or a cleared input; SETTLE-049 resetSubtree reloads only its subtree.',
  schema: layersSchema,
  initialValue: { given: 'external', profile: {} },
  steps: [
    { action: 'batch', steps: [], expect: {
      values: { '/plain': 'schema-plain', '/ranked': 'controls-ranked', '/given': 'external', '/profile/nick': 'host-nick', '/profile/tier': 'basic' },
      outputValue: { plain: 'schema-plain', ranked: 'controls-ranked', given: 'external', profile: { nick: 'host-nick', tier: 'basic' } },
    } },
    { action: 'clear', path: '/plain', expect: { values: { '/plain': undefined } } },
    { action: 'setValue', path: '/profile/nick', value: 'edited', expect: { values: { '/profile/nick': 'edited', '/plain': undefined } } },
    { action: 'resetSubtree', path: '/profile', expect: {
      values: { '/profile/nick': 'host-nick', '/plain': undefined },
      outputValue: { ranked: 'controls-ranked', given: 'external', profile: { nick: 'host-nick', tier: 'basic' } },
    } },
    { action: 'setValue', path: '', value: { given: 'whole' }, expect: {
      values: { '/plain': undefined, '/ranked': undefined, '/profile/tier': undefined }, outputValue: { given: 'whole' },
    } },
    { action: 'reset', expect: {
      outputValue: { plain: 'schema-plain', ranked: 'controls-ranked', given: 'external', profile: { nick: 'host-nick', tier: 'basic' } },
    } },
  ],
};
