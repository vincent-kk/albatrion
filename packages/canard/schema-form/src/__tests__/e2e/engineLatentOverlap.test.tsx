import { describe, expect, it } from 'vitest';

import {
  type JSONSchema as AuthoredSchema,
  ValidationMode,
  SetValueOption as WriteOption,
} from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

/*
 * Settle DETAIL WRITE-079 applies overlapping winners of one round in rank order, so the higher one
 * decides the address they share.
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
  const root = mountEngineForm({
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
  it.each(['sequence', 'batch', 'merge'] as const)(
    'the %s form keeps the higher value',
    (mode) => {
      expect(run(mode)).toEqual(EXPECTED);
    },
  );
});
