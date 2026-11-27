import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import { WriteOption } from '../../../types/value';
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
// filid:contract fixed-first-load-defaults
it.each([
  WriteOption.Overwrite,
  WriteOption.DisableAutomaticWrites,
  WriteOption.EnableAutomaticWrites,
])('T6 keeps every initial/default guard epoch with option %s', (option) => {
  const disableAutomaticWrites = option === WriteOption.EnableAutomaticWrites;
  const actual = observeFixedFirstLoad(schema, {
    option,
    disableAutomaticWrites,
  });
  const oracle = observeFixedFirstLoad(schema, {
    option,
    disableAutomaticWrites,
    general: true,
  });
  expect(actual.snapshot()).toEqual(oracle.snapshot());
  expect(actual.calls.length).toBeGreaterThan(0);
  expectFixedFirstLoadRoute(actual);
});
it.each(['development', 'production'])(
  'T6 preserves a pre-default failure and later success in %s',
  (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    const validator = {
      compile: () => () => null,
      compileGuard: () => (value: unknown) => {
        if (!value || typeof value !== 'object' || !('kind' in value))
          throw new Error('kind absent');
        return true;
      },
    };
    const actual = observeFixedFirstLoad(schema, { validator, dispatch: true });
    const oracle = observeFixedFirstLoad(schema, {
      validator,
      dispatch: true,
      general: true,
    });
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(actual.root.runtime.commitNumber).toBe(1);
    expect(actual.root.runtime.diagnostics.status).toBe(
      environment === 'development' ? 'stable' : 'degraded',
    );
    expect(
      actual.calls.some((call) => JSON.stringify(call).includes('"kind":"a"')),
    ).toBe(true);
    expectFixedFirstLoadRoute(actual);
  },
);

it.each([{}, []])(
  'T6 leaves container-valued scalar defaults on the ordinary path (%j)',
  (value) => {
    const fixture = {
      ...schema,
      properties: {
        kind: { type: 'string', default: 'a' },
        value: { type: 'string', default: value },
      },
    };
    const actual = observeFixedFirstLoad(fixture);
    const oracle = observeFixedFirstLoad(fixture, { general: true });
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(
      Reflect.get(actual.root.runtime.blueprint, 'fixedFirstLoadPlan'),
    ).toBeUndefined();
    expect(actual.prepared).toBe(false);
  },
);
