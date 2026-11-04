import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { useChildFieldErrors } from '@/schema-form/hooks';
import type { FieldInputProps } from '@/schema-form/types';

import { requireRuntimeFieldNode } from '../../../runtime/requireRuntimeFieldNode';

afterEach(cleanup);
class ObservedSet extends Set<() => void> {
  readonly wrapped = new Map<() => void, () => void>();
  readonly calls: ReturnType<typeof vi.fn>[] = [];
  override add(listener: () => void) {
    const callback = vi.fn(listener);
    this.wrapped.set(listener, callback);
    this.calls.push(callback);
    super.add(callback);
    return this;
  }
  override delete(listener: () => void) {
    const callback = this.wrapped.get(listener);
    this.wrapped.delete(listener);
    return super.delete(callback ?? listener);
  }
}
const Branch = ({ node, ChildFields }: FieldInputProps) => {
  useChildFieldErrors(node);
  return (
    <>
      {ChildFields.map((Child) => (
        <Child key={Child.key} />
      ))}
    </>
  );
};
const Leaf = ({ errorVisible }: FieldInputProps) => (
  <span>{String(errorVisible)}</span>
);

it('IR-6 W13 only the three holding displays subscribe and receive a 2000-field settle', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: 2000 }, (_, index) => [
            'f' + index,
            { type: 'string' },
          ]),
        ),
      }}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: Branch },
        { test: () => true, Component: Leaf },
      ]}
      validatorFactory={{
        compile: () => () => [{ dataPath: '/f0', message: 'invalid' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const runtime = requireRuntimeFieldNode(ref.current!.node!).runtime;
  const listeners = new ObservedSet();
  runtime.revealReleaseListeners = listeners;
  act(() => {
    const leaf = ref.current!.findNode('/f0')!;
    leaf.setValue('new');
    leaf.setState({ 4: true });
  });
  expect(listeners.size).toBe(3);
  expect(listeners.calls).toHaveLength(3);
  await settleValidation(() => ref.current?.node);
  expect(
    listeners.calls.every((callback) => callback.mock.calls.length === 1),
  ).toBe(true);
  expect(listeners.size).toBe(0);
});

it('IR-6 W9 changing the Always policy does not reconnect the root load', async () => {
  const ref = createRef<FormHandle>();
  const schema = { type: 'string' } as const;
  const validator = { compile: () => () => [], compileGuard: () => () => true };
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validatorFactory={validator}
      showError={false}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const root = requireRuntimeFieldNode(ref.current!.node!);
  const before = [...(root.runtime.listeners?.get(root) ?? [])];
  expect(before.length).toBeGreaterThan(0);
  act(() => ref.current!.showError());
  const after = [...(root.runtime.listeners?.get(root) ?? [])];
  expect(after).toEqual(before);
});
