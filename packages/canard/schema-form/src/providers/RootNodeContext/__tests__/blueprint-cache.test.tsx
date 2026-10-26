import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { SetValueOption } from '@/schema-form/core';
import { FormWarningCode } from '@/schema-form/errors';

/** Read the runtime proof without exposing it through the public node contract. */
const analysis = (handle: FormHandle) =>
  (handle.node as unknown as { runtime: { blueprint: object } }).runtime.blueprint;

afterEach(cleanup);

it('shares a blueprint across two mounts of the same schema object', () => {
  const schema = { type: 'object' as const, properties: { value: { type: 'string' as const } } };
  const a = createRef<FormHandle>();
  const b = createRef<FormHandle>();
  render(<><Form ref={a} jsonSchema={schema}><span /></Form><Form ref={b} jsonSchema={schema}><span /></Form></>);
  expect(a.current!.node).not.toBe(b.current!.node);
  expect(analysis(a.current!)).toBe(analysis(b.current!));
});

it('delivers blueprint warnings to both forms sharing the authored object', () => {
  const schema = { type: 'object' as const, dependentSchemas: {} };
  const first = vi.fn();
  const second = vi.fn();
  render(<><Form jsonSchema={schema} onError={first}><span /></Form><Form jsonSchema={schema} onError={second}><span /></Form></>);
  for (const collector of [first, second])
    expect(collector).toHaveBeenCalledWith(expect.objectContaining({ code: FormWarningCode.DependentSchemasIgnoredForForm }));
});

it('does not share structurally equal authored objects', () => {
  const a = createRef<FormHandle>();
  const b = createRef<FormHandle>();
  render(<><Form ref={a} jsonSchema={{ type: 'string' }} /><Form ref={b} jsonSchema={{ type: 'string' }} /></>);
  expect(analysis(a.current!)).not.toBe(analysis(b.current!));
});

it('rebuilds only its own tree while another form reset preserves the old blueprint', () => {
  const schema = { type: 'object' as const, properties: { value: { type: 'string' as const } } };
  const a = createRef<FormHandle>();
  const b = createRef<FormHandle>();
  render(<><Form ref={a} jsonSchema={schema}><span /></Form><Form ref={b} jsonSchema={schema}><span /></Form></>);
  const old = analysis(a.current!);
  const otherRoot = b.current!.node;
  act(() => a.current!.rebuild());
  expect(analysis(a.current!)).not.toBe(old);
  expect(analysis(b.current!)).toBe(old);
  act(() => b.current!.reset());
  expect(b.current!.node).toBe(otherRoot);
  expect(analysis(b.current!)).toBe(old);
  act(() => b.current!.rebuild());
  expect(b.current!.node).not.toBe(otherRoot);
  expect(analysis(b.current!)).not.toBe(old);
});

it('forwards automatic-write overrides through rebuild reset semantics', () => {
  const ref = createRef<FormHandle>();
  const schema = { type: 'object' as const, properties: { source: { type: 'number' as const, default: 2 }, target: { type: 'number' as const, default: 0, controls: { derived: '../source * 2' } } } };
  render(<Form ref={ref} jsonSchema={schema} defaultValue={{ source: 2, target: 0 }} disableAutomaticWrites><span /></Form>);
  expect(ref.current!.getValue()).toEqual({ source: 2, target: 0 });
  act(() => ref.current!.rebuild(SetValueOption.EnableAutomaticWrites));
  expect(ref.current!.getValue()).toEqual({ source: 2, target: 4 });
});
