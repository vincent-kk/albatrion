import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import { WriteOption } from '../../../types/value';
import { dispatchSetValue } from '../../../write';
import { observeFixedFirstLoad } from './fixtures/observeFixedFirstLoad';

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
// filid:contract fixed-first-load-observables
it.each([
  [true, 'a', true],
  [true, 'b', false],
  [false, 'a', true],
  [false, 'b', true],
  [false, 'a', false],
] as const)(
  'T4 matches missing=%s kind=%s else=%s including synchronous listeners',
  (missing, kind, withElse) => {
    const fixture = {
      ...schema,
      properties: {
        kind: { type: 'string', default: kind },
        value: { type: 'string', default: 'x' },
      },
      ...(withElse ? {} : { else: undefined }),
    };
    const actual = observeFixedFirstLoad(fixture, { missing, dispatch: true });
    const oracle = observeFixedFirstLoad(fixture, {
      missing,
      dispatch: true,
      general: true,
    });
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(actual.work.commits).toBe(oracle.work.commits);
    expect(actual.prepared).toBe(true);
  },
);
it('T5 preserves first writes, schema events, identities and selected IDs across both flips', () => {
  const actual = observeFixedFirstLoad(schema, { dispatch: true });
  const oracle = observeFixedFirstLoad(schema, {
    dispatch: true,
    general: true,
  });
  const child = actual.root.structure!.value;
  const children = actual.root.children;
  for (const kind of ['b', 'a', 'a']) {
    dispatchSetValue(actual.root.structure!.kind, kind, WriteOption.Overwrite);
    dispatchSetValue(oracle.root.structure!.kind, kind, WriteOption.Overwrite);
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(actual.root.structure!.value).toBe(child);
    expect(actual.root.children).toBe(children);
    expect(child.emit).toBe('x');
    expect(child.schema.schema).toMatchObject(
      kind === 'a' ? { minLength: 2 } : { maxLength: 3 },
    );
  }
  expect(actual.prepared).toBe(true);
});

it('T4 preserves call-sensitive synchronous guards without a purity assumption', () => {
  const run = (general: boolean) => {
    let calls = 0;
    return observeFixedFirstLoad(schema, {
      general,
      validator: {
        compile: () => () => null,
        compileGuard: () => () => ++calls % 3 === 0,
      },
    });
  };
  const actual = run(false);
  const oracle = run(true);
  expect(actual.snapshot()).toEqual(oracle.snapshot());
  expect(actual.work.rootRounds).toBe(oracle.work.rootRounds);
  expect(actual.work.commits).toBe(oracle.work.commits);
  expect(actual.prepared).toBe(true);
});
