import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

/*
 * Settle DETAIL WRITE-079 applies overlapping winners of one round in rank order, so the higher one
 * decides the address they share. Known defect: when the lower winner writes a live object whole and
 * the higher winner names an inactive child of it by its own path, the compute after the higher write
 * replays the lower winner's distribution into the child's slot. The sequence of the same two calls
 * keeps the higher value; one batch and one Merge write keep the lower one.
 */

const schema: AuthoredSchema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    o: {
      type: 'object',
      properties: {
        p: { type: 'string' },
        q: { type: 'string', controls: { active: '/on === true' } },
      },
    },
    parent: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string'
            ? { '../o': { p: `${value}p`, q: `${value}q` } }
            : {},
      },
    },
    leaf: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../o/q': `${value}leaf` } : {},
      },
    },
  },
};

const EXPECTED = {
  value: { on: false, o: { p: 'Pp' }, parent: 'P', leaf: 'L' },
  retained: [{ path: '/o/q', value: 'Lleaf' }],
};

const run = (mode: 'sequence' | 'batch' | 'merge') => {
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { on: false, o: { p: 'p0', q: 'q0' } },
    validationMode: ValidationMode.None,
  });
  if (mode === 'merge')
    root.setValue({ parent: 'P', leaf: 'L' }, WriteOption.Merge);
  else {
    const calls = () => {
      root.find('/parent')!.setValue('P');
      root.find('/leaf')!.setValue('L');
    };
    if (mode === 'batch') root.batch(calls);
    else calls();
  }
  return {
    value: root.value,
    retained: root.inactiveValues.map(({ path, value }) => ({ path, value })),
  };
};

describe('a higher own-path write to an inactive child of a lower whole object write (WRITE-079)', () => {
  it('the sequence keeps the higher value', () => {
    expect(run('sequence')).toEqual(EXPECTED);
  });

  it.fails('one batch keeps the higher value', () => {
    expect(run('batch')).toEqual(EXPECTED);
  });

  it.fails('one Merge write keeps the higher value', () => {
    expect(run('merge')).toEqual(EXPECTED);
  });
});
