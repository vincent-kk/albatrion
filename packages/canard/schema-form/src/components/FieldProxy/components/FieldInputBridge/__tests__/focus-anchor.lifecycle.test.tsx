import { useImperativeHandle, useRef } from 'react';

import { act } from '@testing-library/react';
import { type Mock, afterEach, expect, it, vi } from 'vitest';

import { type FormHarness, renderForm } from '@/schema-form/__tests__/renderForm';
import {
  FieldLifecycle,
  FieldLifecycleAction,
} from '@/schema-form/helpers/fieldLifecycle';
import { useFieldLifecycleContext } from '@/schema-form/providers/FieldLifecycleContext';
import { useWorkspaceContext } from '@/schema-form/providers/WorkspaceContext';
import type { FieldInputProps } from '@/schema-form/types';

let form: FormHarness;
afterEach(() => {
  form?.unmount();
  vi.restoreAllMocks();
});

it('uses the committed native ref for initial Mount and later Render in StrictMode', async () => {
  const focuses = vi.spyOn(HTMLElement.prototype, 'focus');
  const registry: { current: ReturnType<typeof useFieldLifecycleContext> } = {
    current: null,
  };
  const Input = ({ node, focusRef, value }: FieldInputProps) => {
    registry.current = useFieldLifecycleContext();
    const reserved = useRef(false);
    if (!reserved.current) {
      reserved.current = true;
      registry.current?.reserve(
        node,
        FieldLifecycle.Mount,
        () => FieldLifecycleAction.Focus,
      );
    }
    return (
      <div ref={focusRef} tabIndex={-1} aria-label="lifecycle anchor">
        {String(value)}
      </div>
    );
  };
  form = await renderForm(
    { type: 'string', presentation: { controlled: true, FieldInput: Input } },
    { strictMode: true },
  );
  const target = form.container.querySelector(
    '[aria-label="lifecycle anchor"]',
  );
  expect(document.activeElement).toBe(target);
  expect(focuses).toHaveBeenCalledTimes(1);
  const node = form.node('')!;
  registry.current!.reserve(
    node,
    FieldLifecycle.Render,
    () => FieldLifecycleAction.Focus,
  );
  await act(async () => node.setValue('render again'));
  expect(document.activeElement).toBe(target);
  expect(focuses).toHaveBeenCalledTimes(2);
});

it('releases the position and command subscription when an initial focus handle throws', async () => {
  const subscriptions: Mock<() => void>[] = [];
  let subscriptionsAtFocus: Mock<() => void>[] = [];
  const focus = vi.fn(() => {
    subscriptionsAtFocus = subscriptions.slice();
    throw new Error('initial anchor focus');
  });
  const workspaces: object[] = [];
  const Input = ({ node, focusRef }: FieldInputProps) => {
    workspaces.push(useWorkspaceContext());
    const registry = useFieldLifecycleContext();
    const reserved = useRef(false);
    if (!reserved.current) {
      reserved.current = true;
      const subscribe = node.subscribe.bind(node);
      vi.spyOn(node, 'subscribe').mockImplementation((listener) => {
        const unsubscribe = vi.fn(subscribe(listener));
        subscriptions.push(unsubscribe);
        return unsubscribe;
      });
      registry?.reserve(
        node,
        FieldLifecycle.Mount,
        () => FieldLifecycleAction.Focus,
      );
    }
    useImperativeHandle(focusRef, () => ({ focus }), []);
    return <input aria-label="throwing anchor" />;
  };
  form = await renderForm({
    type: 'string',
    presentation: { FieldInput: Input },
  });
  expect(focus).toHaveBeenCalledTimes(1);
  expect(subscriptionsAtFocus).toHaveLength(1);
  expect(subscriptionsAtFocus[0]).toHaveBeenCalledExactlyOnceWith();
  const inputPositions = Reflect.get(workspaces[0], 'inputPositions');
  expect(inputPositions.size).toBe(0);
});
