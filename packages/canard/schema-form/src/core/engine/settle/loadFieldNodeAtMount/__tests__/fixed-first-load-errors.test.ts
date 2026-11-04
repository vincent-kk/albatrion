import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import {
  expectFixedFirstLoadRoute,
  observeFixedFirstLoad,
} from './fixtures/observeFixedFirstLoad';

/** Fixed membership with scalar defaults and both constraint branches. */
const schema: BlueprintSchema = {
  type: 'object',
  properties: {
    kind: { type: 'string', default: 'a' },
    value: { type: 'string', default: 'x' },
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
  else: { properties: { value: { maxLength: 3 } } },
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
// filid:contract fixed-first-load-errors
it.each([
  [0, true],
  [0, false],
  [1, true],
  [1, false],
] as const)(
  'T7 missing validator mode=%s consumer=%s closes both branches',
  (mode, consumer) => {
    const actual = observeFixedFirstLoad(schema, {
      missing: true,
      dispatch: true,
      mode,
      consumer,
    });
    const oracle = observeFixedFirstLoad(schema, {
      missing: true,
      dispatch: true,
      mode,
      consumer,
      general: true,
    });
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(actual.root.structure!.value.schema.schema).not.toHaveProperty(
      'minLength',
    );
    expect(actual.root.structure!.value.schema.schema).not.toHaveProperty(
      'maxLength',
    );
    expectFixedFirstLoadRoute(actual);
  },
);
it.each(['compile', 'evaluate', 'promise', 'nonboolean'])(
  'T7 preserves %s failure with one commit and no retry',
  (mode) => {
    const validator = {
      compile: () => () => null,
      compileGuard: () => {
        if (mode === 'compile') throw new Error('compile failure');
        return () => {
          if (mode === 'evaluate') throw new Error('evaluate failure');
          return (mode === 'promise'
            ? Promise.resolve(true)
            : undefined) as unknown as boolean;
        };
      },
    };
    const actual = observeFixedFirstLoad(schema, { validator, dispatch: true });
    const oracle = observeFixedFirstLoad(schema, {
      validator,
      dispatch: true,
      general: true,
    });
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(actual.work.commits).toBe(1);
    expectFixedFirstLoadRoute(actual);
  },
);
