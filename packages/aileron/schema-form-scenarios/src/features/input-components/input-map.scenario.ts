import type { FormScenario } from '../../types';
import type { InputWinner } from './types';

/** Nested object, array items, and declared object children addressed by map keys. */
const mapSchema = {
  type: 'object',
  properties: {
    profile: { type: 'object', properties: { name: { type: 'string' }, nickname: { type: 'string' } } },
    tags: { type: 'array', items: { type: 'string' } },
    meta: { type: 'object', properties: { color: { type: 'string' }, size: { type: 'string' } } },
  },
};

/** fieldInputMap keys: an exact pointer, a regular expression, and `*` wildcards over array items and declared object children. */
export const inputMapScenario: FormScenario = {
  name: 'input-components.input-map',
  description: 'fieldInputMap keys are JSON pointers: an exact pointer matches one node, a key with a standalone `*` segment matches exactly one segment there, and any other key also matches as an unanchored regular expression (CONTROLS-080 keeps `*` only for findNodes and map keys); dynamic keys are not nodes (SCHEMA-040), so a wildcard reaches only declared children. Keys and winners come from inputMapCase.',
  schema: mapSchema,
  initialValue: { profile: { name: 'Kim', nickname: 'K' }, tags: ['a', 'b'], meta: { color: 'red', size: 'M' } },
  steps: [{ action: 'batch', steps: [], expect: { shape: { '/profile/name': 'present', '/tags/1': 'present', '/meta/color': 'present' } } }],
};

/** Map keys to labels and the winner at each path. */
export const inputMapCase: Readonly<{ map: Readonly<Record<string, string>>; winners: Readonly<Record<string, InputWinner>> }> = {
  map: { '/profile/name': 'exact', '/tags/*': 'items', '/meta/*': 'keys', '^/profile/nick': 'pattern' },
  winners: { '/profile/name': 'exact', '/profile/nickname': 'pattern', '/tags/0': 'items', '/tags/1': 'items', '/meta/color': 'keys', '/meta/size': 'keys' },
};
