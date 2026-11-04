import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import { ValidationMode } from '../../../types/state';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import { dispatchValidate } from '../../../write';
import {
  expectFixedFirstLoadRoute,
  observeFixedFirstLoad,
} from './fixtures/observeFixedFirstLoad';

/** Independent root and nested guards share fixed membership, not guard verdicts. */
const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', default: 'a' },
    value: { type: 'string', default: 'xx' },
  },
  if: { required: ['kind'], properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
  else: { properties: { value: { maxLength: 3 } } },
} satisfies BlueprintSchema;
afterEach(() => vi.restoreAllMocks());

// filid:contract fixed-first-load-review-guards
it.each([ValidationMode.None, ValidationMode.OnRequest])(
  'T4 valid validator keeps guard execution and requested validation in mode %s',
  async (mode) => {
    const actual = observeFixedFirstLoad(schema, { mode, dispatch: true });
    const oracle = observeFixedFirstLoad(schema, {
      mode,
      dispatch: true,
      general: true,
    });
    expectFixedFirstLoadRoute(actual);
    expect(actual.calls.length).toBeGreaterThan(0);
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    const actualIssues = await dispatchValidate(actual.root);
    const oracleIssues = await dispatchValidate(oracle.root);
    expect(actualIssues).toEqual(oracleIssues);
    expect(actual.snapshot()).toEqual(oracle.snapshot());
  },
);

it.each([false, true])(
  'T6/T8 parent edges preserve nested default verdict changes (negated=%s)',
  (negated) => {
    const condition = schema.if;
    const local = { ...schema, if: negated ? { not: condition } : condition };
    const fixture = {
      ...local,
      properties: { ...schema.properties, group: local },
    };
    const actual = observeFixedFirstLoad(fixture);
    const oracle = observeFixedFirstLoad(fixture, { general: true });
    expectFixedFirstLoadRoute(actual);
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(actual.work.rootRounds).toBe(oracle.work.rootRounds);
    expect(actual.calls).toEqual(oracle.calls);
    const calls = actual.calls as { pointer: string; value: unknown }[];
    for (const pointer of ['/if', '/properties/group/if']) {
      const inputs = calls.filter((call) => call.pointer === pointer);
      expect(
        inputs.some(({ value }) => !JSON.stringify(value).includes('"kind"')),
      ).toBe(true);
      expect(
        inputs.some(({ value }) =>
          JSON.stringify(value).includes('"kind":"a"'),
        ),
      ).toBe(true);
    }
    for (const host of [actual.root, actual.root.structure!.group]) {
      expect(host.structure!.value.schema.schema).toMatchObject(
        negated ? { maxLength: 3 } : { minLength: 2 },
      );
      for (const node of [host, host.structure!.value])
        expect(
          actual.root.runtime.committedDeclarationIds?.get(
            getCommittedDeclarationKey(node, node.runtime),
          ),
        ).toBeDefined();
    }
  },
);

it.each([
  ['array', { type: 'array', items: { type: 'string' } }],
  ['oneOf', { type: 'string', oneOf: [{ minLength: 1 }] }],
  ['anyOf', { type: 'string', anyOf: [{ minLength: 1 }] }],
] as const)(
  'T8 unaffected sibling %s forces whole-tree fallback',
  (_name, child) => {
    const fixture = {
      ...schema,
      properties: {
        ...schema.properties,
        unaffected: { type: 'object', properties: { child } },
      },
    };
    const actual = observeFixedFirstLoad(fixture);
    const oracle = observeFixedFirstLoad(fixture, { general: true });
    expect(actual.prepared).toBe(false);
    expect(actual.root.runtime.blueprint.fixedFirstLoadPlan).toBeUndefined();
    expect(actual.snapshot()).toEqual(oracle.snapshot());
  },
);

it('T4 crossing baseline and selected constraints remain runtime validation outcomes', async () => {
  const fixture = {
    ...schema,
    properties: {
      ...schema.properties,
      value: { type: 'string', default: 'xx', maxLength: 1 },
    },
  };
  const actual = observeFixedFirstLoad(fixture, {
    mode: ValidationMode.OnRequest,
  });
  const oracle = observeFixedFirstLoad(fixture, {
    mode: ValidationMode.OnRequest,
    general: true,
  });
  expectFixedFirstLoadRoute(actual);
  expect(actual.error).toBeUndefined();
  expect(actual.snapshot()).toEqual(oracle.snapshot());
  expect(actual.root.structure!.value.schema.schema).toMatchObject({
    minLength: 2,
    maxLength: 1,
  });
  const issues = await dispatchValidate(actual.root);
  expect(issues).toEqual(await dispatchValidate(oracle.root));
  expect(issues.some((issue) => issue.keyword === 'maxLength')).toBe(true);
});

it('T4 opaque reference guard retains whole-host reads and ordinary inputs', () => {
  const fixture = {
    ...schema,
    definitions: { condition: schema.if },
    if: { $ref: '#/definitions/condition' },
  };
  const actual = observeFixedFirstLoad(fixture);
  const oracle = observeFixedFirstLoad(fixture, { general: true });
  expectFixedFirstLoadRoute(actual);
  expect(actual.error).toBeUndefined();
  expect(actual.calls.length).toBeGreaterThan(0);
  expect(actual.snapshot()).toEqual(oracle.snapshot());
  expect(actual.root.structure!.value.schema.schema).toMatchObject({
    minLength: 2,
  });
});
