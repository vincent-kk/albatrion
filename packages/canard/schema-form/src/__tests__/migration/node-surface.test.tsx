import { act } from '@testing-library/react';
import { afterEach, expect, expectTypeOf, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldNode,
  FieldNodeEventType,
  FieldNodeState,
  type InferFieldNode,
  SetValueOption,
  type UnionNode,
  type ValidationIssue,
  isSchemaFormError,
  isTerminalNode,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

it('LANDING-024 validation errors use ValidationIssue without the retired alias', async () => {
  // @ts-expect-error The package no longer exports the legacy error interface.
  type Removed = import('@/schema-form').JSONSchemaError;
  expectTypeOf<Removed>().toBeAny();
  form = await renderForm(
    { type: 'string', minLength: 3 },
    { validator: true, defaultValue: 'x' },
  );
  const issues: readonly ValidationIssue[] = await form.validate();
  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ keyword: 'minLength', dataPath: '' }),
    ]),
  );
});

it('LANDING-043 node strategy replaces group for rendered branch and terminal nodes', async () => {
  form = await renderForm({
    type: 'object',
    properties: { name: { type: 'string' } },
  });
  expect(form.handle.node?.strategy).toBe('branch');
  expect(form.node('/name')?.strategy).toBe('terminal');
  expect(form.handle.node).not.toHaveProperty('group');
  expect(form.field('/name')).not.toBeNull();
});

it('LANDING-154 node key and schemaPath are absent from the public surface', async () => {
  form = await renderForm({ type: 'string' });
  expect(form.handle.node).not.toHaveProperty('key');
  expect(form.handle.node).not.toHaveProperty('schemaPath');
  expectTypeOf<
    Extract<keyof FieldNode, 'key' | 'schemaPath'>
  >().toEqualTypeOf<never>();
});

it('LANDING-156 context is not a navigable node', async () => {
  form = await renderForm({ type: 'string' }, { context: { external: 1 } });
  expect(form.handle.node?.find('@')).toBeNull();
  expect(form.handle.node?.findNodes('@')).toEqual([]);
});

it('LANDING-157 LANDING-158 public state and event names have no old aliases', async () => {
  // @ts-expect-error State exports use the FieldNode prefix.
  type OldState = import('@/schema-form').NodeState;
  // @ts-expect-error Event exports use the FieldNode prefix.
  type OldEvent = import('@/schema-form').NodeEventType;
  expectTypeOf<OldState>().toBeAny();
  expectTypeOf<OldEvent>().toBeAny();
  form = await renderForm({ type: 'string' });
  const events: number[] = [];
  const stop = form.handle.node!.subscribe(({ type }) => events.push(type));
  await act(async () => form.handle.setState({ [FieldNodeState.Edited]: true }));
  expect(form.handle.getState()[FieldNodeState.Edited]).toBe(true);
  expect(events.some((type) => type & FieldNodeEventType.UpdateState)).toBe(
    true,
  );
  stop();
});

it('LANDING-160 close numeric values remain distinct writes', async () => {
  form = await renderForm({ type: 'number' }, { defaultValue: 1 });
  await form.setValue(1 + Number.EPSILON);
  expect(form.getValue()).toBe(1 + Number.EPSILON);
  expect(form.changeLog()).toEqual([1 + Number.EPSILON]);
});

it('LANDING-162 class instances compare by identity rather than structure', async () => {
  class Value {
    field = 1;
  }
  form = await renderForm({ type: 'object', options: { terminal: true } });
  const first = new Value();
  const second = new Value();
  await form.setValue(first);
  await form.setValue(second);
  expect(form.getValue()).toBe(second);
  expect(form.getValue()).not.toBe(first);
  expect(form.changeLog()).toHaveLength(2);
});

it('LANDING-141 Overwrite combined with Merge throws INVALID_WRITE_OPTION', async () => {
  form = await renderForm({ type: 'string' }, { defaultValue: 'kept' });
  expect(() =>
    form.handle.setValue(
      'bad',
      SetValueOption.Overwrite | SetValueOption.Merge,
    ),
  ).toThrowError(
    expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION' }),
  );
  expect(form.getValue()).toBe('kept');
});

it('LANDING-021 write options expose four independent bits', () => {
  expect(SetValueOption).toEqual({
    Overwrite: 1,
    Merge: 2,
    DisableAutomaticWrites: 4,
    EnableAutomaticWrites: 8,
  });
});

it('LANDING-147 same-length strings cannot be split into virtual field writes', async () => {
  form = await renderForm(
    {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      options: { virtual: { group: { fields: ['a', 'b'] } } },
    },
    { defaultValue: { a: 'A', b: 'B' } },
  );
  let failure: unknown;
  try {
    form.node('/group')!.setValue('xy' as never);
  } catch (error) {
    failure = error;
  }
  expect(isSchemaFormError(failure)).toBe(true);
  expect(failure).toMatchObject({
    code: 'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES',
  });
  expect(form.getValue()).toEqual({ a: 'A', b: 'B' });
});

it('LANDING-188 LANDING-190 union narrowing reaches the terminal union node', async () => {
  expectTypeOf<
    FieldInputProps<string | number>['node']
  >().toExtend<UnionNode>();
  expectTypeOf<FieldInputProps<string | number | null>['node']>().toEqualTypeOf<
    UnionNode<readonly ['string', 'number'], true>
  >();
  expectTypeOf<
    FieldInputProps<'a' | 'b'>['node']['type']
  >().toEqualTypeOf<'string'>();
  expectTypeOf<
    InferFieldNode<{ type: readonly ['string', 'number'] }>
  >().toEqualTypeOf<UnionNode<readonly ['string', 'number'], false>>();
  form = await renderForm({ type: ['string', 'number'] });
  const node = form.handle.node!;
  expect(isTerminalNode(node)).toBe(true);
  if (isTerminalNode(node) && node.type === 'union')
    expectTypeOf(node).toExtend<UnionNode>();
  expect(node.type).toBe('union');
});
