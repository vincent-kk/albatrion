import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

/*
 * Settle DETAIL WRITE-079: overlapping declarative winners apply from the lowest rank up, so the
 * higher winner decides an address both name. Here a lower rule names the descendant /o/y and a
 * higher rule names the whole /o, in the settlement that makes /o leave; the leaving record and,
 * when a later rule reopens /o, the revived node both end with the higher winner's y, as the same
 * calls in sequence do.
 */

type Mode = 'merge' | 'batch' | 'nested';

const inject = (target: string, value: unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) => (source ? { [target]: value } : {}),
  },
});

const createSchema = (isRevived: boolean): AuthoredSchema => ({
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    low: inject('../o/y', 'low'),
    o: {
      type: 'object',
      controls: { active: '/on === true' },
      properties: { x: { type: 'string' }, y: { type: 'string' } },
    },
    high: inject('../o', { x: 'highX', y: 'high' }),
    ...(isRevived ? { reopen: inject('../on', true) } : {}),
  },
});

const run = (isRevived: boolean, mode: Mode) => {
  const root = nodeFromJSONSchema({
    jsonSchema: createSchema(isRevived),
    defaultValue: { on: true, o: { x: 'x0', y: 'y0' } },
    validationMode: ValidationMode.None,
  });
  const values: Record<string, unknown> = {
    on: false,
    low: 'l',
    high: 'h',
    ...(isRevived ? { reopen: 'r' } : {}),
  };
  const apply = () => {
    for (const [name, value] of Object.entries(values))
      root.find(`/${name}`)!.setValue(value);
  };
  if (mode === 'merge') root.setValue(values, WriteOption.Merge);
  else if (mode === 'batch') root.batch(apply);
  else root.batch(() => root.batch(apply));
  return {
    o: root.find('/o')?.value,
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
  };
};

it.each(['merge', 'batch', 'nested'] as const)(
  'a higher whole winner over a lower descendant winner decides the leaving record (%s)',
  (mode) => {
    expect(run(false, mode)).toEqual({
      o: undefined,
      retained: { '/o/x': 'highX', '/o/y': 'high' },
    });
  },
);

it.each(['merge', 'batch', 'nested'] as const)(
  'a higher whole winner over a lower descendant winner decides the revived node (%s)',
  (mode) => {
    expect(run(true, mode)).toEqual({
      o: { x: 'highX', y: 'high' },
      retained: {},
    });
  },
);
