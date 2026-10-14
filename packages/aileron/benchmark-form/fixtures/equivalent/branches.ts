import type { JSONSchema } from '@canard/schema-form';

import type { EquivalentFixture } from './types';

export const branchFixtures: EquivalentFixture[] = [5, 10, 20].map((count) => ({
  name: `oneOf-${count}`,
  legacy: {
    type: 'object',
    properties: {
      common: { type: 'string', default: 'shared' },
      kind: { type: 'string', default: 'kind_0' },
    },
    oneOf: Array.from({ length: count }, (_, index) => ({
      '&if': `./kind === 'kind_${index}'`,
      properties: {
        [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
        [`payload_${index}_b`]: { type: 'number', default: index },
        [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
      },
    })),
  } as JSONSchema,
  workspace: {
    type: 'object',
    properties: {
      common: { type: 'string', default: 'shared' },
      kind: { type: 'string', default: 'kind_0' },
    },
    oneOf: Array.from({ length: count }, (_, index) => ({
      controls: { active: `./kind === 'kind_${index}'` },
      properties: {
        [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
        [`payload_${index}_b`]: { type: 'number', default: index },
        [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
      },
    })),
  } as JSONSchema,
  interactions: [
    { kind: 'set', path: '/kind', value: `kind_${count - 1}` },
    { kind: 'set', path: '/kind', value: 'kind_0' },
  ],
}));
