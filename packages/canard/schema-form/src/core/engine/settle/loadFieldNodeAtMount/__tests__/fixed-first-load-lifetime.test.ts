import { afterEach, expect, it, vi } from 'vitest';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import type { BlueprintSchema } from '../../../blueprint';
import { WriteOption } from '../../../types/value';
import { dispatchSetValue } from '../../../write';
import { dispatchResetForm, subscribeFieldNode } from '../../../write';
import * as compute from '../../utils/compute/computeNode';
import * as output from '../../utils/output/updateOutput';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
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

// filid:contract fixed-first-load-lifetime
it('T12 releases preparation after successful and failed assembly', () => {
  const actual = observeFixedFirstLoad(schema);
  expect(actual.prepared).toBe(true);
  expect(
    actual.contexts.every(
      (context) => Reflect.get(context, 'fixedFirstLoad') === undefined,
    ),
  ).toBe(true);
  const body = output.updateOutput;
  let count = 0;
  const failure = vi
    .spyOn(output, 'updateOutput')
    .mockImplementation((node, context, children) => {
      if (++count === 2) throw new Error('assembly interrupted');
      return body(node, context, children);
    });
  const failed = observeFixedFirstLoad(schema);
  failure.mockRestore();
  expect(failed.error).toMatchObject({ message: 'assembly interrupted' });
  expect(failed.work.commits).toBe(0);
  expect(
    failed.contexts.every(
      (context) => Reflect.get(context, 'fixedFirstLoad') === undefined,
    ),
  ).toBe(true);
});
it('T12 a reused root and listener-triggered input cannot reuse mount preparation', () => {
  const actual = observeFixedFirstLoad(schema, { dispatch: true });
  const oracle = observeFixedFirstLoad(schema, {
    dispatch: true,
    general: true,
  });
  for (const tree of [actual, oracle]) {
    let once = false;
    subscribeFieldNode(tree.root, () => {
      if (once) return;
      once = true;
      dispatchSetValue(tree.root.structure!.kind, 'a', WriteOption.Overwrite);
    });
    dispatchSetValue(tree.root.structure!.kind, 'b', WriteOption.Overwrite);
    loadFieldNodeAtMount(tree.root, undefined, WriteOption.Overwrite);
    dispatchResetForm(tree.root, undefined, WriteOption.Overwrite, {
      deferValidation: true,
    });
  }
  expect(actual.snapshot()).toEqual(oracle.snapshot());
  expect(
    actual.contexts.every(
      (context) => Reflect.get(context, 'fixedFirstLoad') === undefined,
    ),
  ).toBe(true);
});

it('T12 explicit caller input declines preparation before the ordinary commit', () => {
  const { root } = createTestTree(schema);
  const computeSpy = vi.spyOn(compute, 'computeNode');
  loadFieldNodeAtMount(
    root,
    { kind: 'b', value: 'explicit' },
    WriteOption.Overwrite,
  );
  expect(computeSpy.mock.calls.length).toBeGreaterThan(0);
  for (const [, context] of computeSpy.mock.calls)
    expect(Reflect.get(context, 'fixedFirstLoad')).toBeUndefined();
  expect(root.runtime.commitNumber).toBe(1);
  expect(root.emit).toEqual({ kind: 'b', value: 'explicit' });
  expect(root.structure!.value.schema.schema).toMatchObject({ maxLength: 3 });
});
