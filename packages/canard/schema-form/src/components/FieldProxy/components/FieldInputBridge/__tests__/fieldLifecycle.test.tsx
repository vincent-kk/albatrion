import * as React from 'react';
import { useRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { type FieldNode, FieldNodeRequestType } from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';
import {
  FieldLifecycle,
  FieldLifecycleAction,
} from '@/schema-form/helpers/fieldLifecycle';
import { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle/FieldLifecycleRegistry';
import { useFieldLifecycleContext } from '@/schema-form/providers/FieldLifecycleContext';
import type { FieldInputProps } from '@/schema-form/types';

import { useFieldLifecycle } from '../hooks/useFieldLifecycle';

/** Stable dependencies keep ordinary renders from becoming new Mount events. */
const noop = () => {};
/** A real input position exercising the hook without Form render scheduling. */
const Position = ({
  node,
  registry,
  commit = noop,
  input = true,
}: {
  node: FieldNode;
  registry: FieldLifecycleRegistry;
  commit?: () => void;
  input?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const detector = useFieldLifecycle(
    node,
    ref,
    commit,
    noop,
    undefined,
    null,
    input ? registry : null,
  );
  return input ? (
    <div ref={ref}>
      <input defaultValue="text" />
      {detector}
    </div>
  ) : null;
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each([false, true])('field lifecycle, strict=%s', (strict) => {
  it('runs Mount with an attached container, then Render, focusing and selecting once', () => {
    const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
    const registry = new FieldLifecycleRegistry(vi.fn());
    const order: string[] = [];
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const select = vi.spyOn(HTMLInputElement.prototype, 'select');
    registry.reserve(node, FieldLifecycle.Mount, () => {
      expect(document.querySelector('input')).not.toBeNull();
      order.push('mount');
      return FieldLifecycleAction.Focus | FieldLifecycleAction.Select;
    });
    registry.reserve(node, FieldLifecycle.Render, () => {
      order.push('render');
      return FieldLifecycleAction.None;
    });
    const view = render(<Position node={node} registry={registry} />, {
      reactStrictMode: strict,
    });
    const input = view.container.querySelector('input')!;
    expect(order).toEqual(['mount', 'render']);
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 4]);
    expect(
      select.mock.contexts.filter((element) => element === input),
    ).toHaveLength(1);
    expect(
      focus.mock.contexts.filter((element) => element === input),
    ).toHaveLength(1);
  });
  it('does not consume a Mount re-reservation in effect replay', () => {
    const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
    const registry = new FieldLifecycleRegistry(vi.fn());
    const again = vi.fn(() => FieldLifecycleAction.None);
    registry.reserve(node, FieldLifecycle.Mount, () => {
      registry.reserve(node, FieldLifecycle.Mount, again);
      return FieldLifecycleAction.None;
    });
    render(<Position node={node} registry={registry} />, {
      reactStrictMode: strict,
    });
    expect(again).not.toHaveBeenCalled();
    expect(registry.has(node, FieldLifecycle.Mount)).toBe(true);
  });
  it('executes Render once per commit even when a new detector re-reserves during replay', () => {
    const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
    const registry = new FieldLifecycleRegistry(vi.fn());
    const view = render(<Position node={node} registry={registry} />, {
      reactStrictMode: strict,
    });
    const again = vi.fn(() => FieldLifecycleAction.None);
    const first = vi.fn(() => {
      registry.reserve(node, FieldLifecycle.Render, again);
      return FieldLifecycleAction.None;
    });
    registry.reserve(node, FieldLifecycle.Render, first);
    expect(first).not.toHaveBeenCalled();
    view.rerender(<Position node={node} registry={registry} />);
    expect(first).toHaveBeenCalledTimes(1);
    expect(again).not.toHaveBeenCalled();
    view.rerender(<Position node={node} registry={registry} />);
    expect(again).toHaveBeenCalledTimes(1);
  });
  it('orders dependency cleanup, Mount and Render with no duplicate detector execution', () => {
    const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
    const registry = new FieldLifecycleRegistry(vi.fn());
    const view = render(<Position node={node} registry={registry} />, {
      reactStrictMode: strict,
    });
    const order: FieldLifecycle[] = [];
    for (const point of [
      FieldLifecycle.Unmount,
      FieldLifecycle.Mount,
      FieldLifecycle.Render,
    ])
      registry.reserve(node, point, (event) => {
        order.push(event.type);
        return FieldLifecycleAction.None;
      });
    const next = vi.fn(() => FieldLifecycleAction.None);
    registry.reserve(node, FieldLifecycle.Render, () => {
      registry.reserve(node, FieldLifecycle.Render, next);
      return FieldLifecycleAction.None;
    });
    const input = view.container.querySelector('input');
    view.rerender(
      <Position node={node} registry={registry} commit={() => {}} />,
    );
    expect(view.container.querySelector('input')).toBe(input);
    expect(order).toEqual([
      FieldLifecycle.Unmount,
      FieldLifecycle.Mount,
      FieldLifecycle.Render,
    ]);
    expect(next).not.toHaveBeenCalled();
  });
  it('ignores Unmount actions and does not emit from an absent input', () => {
    const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
    const registry = new FieldLifecycleRegistry(vi.fn());
    const mount = vi.fn(() => FieldLifecycleAction.Focus);
    registry.reserve(node, FieldLifecycle.Mount, mount);
    const view = render(
      <Position node={node} registry={registry} input={false} />,
      { reactStrictMode: strict },
    );
    expect(mount).not.toHaveBeenCalled();
    view.rerender(<Position node={node} registry={registry} />);
    expect(mount).toHaveBeenCalledTimes(1);
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const unmount = vi.fn(() => FieldLifecycleAction.Focus);
    registry.reserve(node, FieldLifecycle.Unmount, unmount);
    view.rerender(<Position node={node} registry={registry} input={false} />);
    expect(unmount).toHaveBeenCalledTimes(1);
    expect(focus).not.toHaveBeenCalled();
    const order: string[] = [];
    registry.reserve(node, FieldLifecycle.Mount, () => {
      order.push('mount');
      return FieldLifecycleAction.None;
    });
    registry.reserve(node, FieldLifecycle.Render, () => {
      order.push('render');
      return FieldLifecycleAction.None;
    });
    view.rerender(<Position node={node} registry={registry} />);
    expect(order).toEqual(['mount', 'render']);
  });
});

it.skipIf(!React.Activity)(
  'Activity reconnect after an ordinary render consumes only Unmount',
  () => {
    const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
    const registry = new FieldLifecycleRegistry(vi.fn());
    const tree = (mode: 'visible' | 'hidden') => (
      <React.Activity mode={mode}>
        <Position node={node} registry={registry} />
      </React.Activity>
    );
    const view = render(tree('visible'));
    view.rerender(tree('visible'));
    const mount = vi.fn(() => FieldLifecycleAction.None);
    const renderHandler = vi.fn(() => FieldLifecycleAction.None);
    const unmount = vi.fn(() => FieldLifecycleAction.None);
    registry.reserve(node, FieldLifecycle.Mount, mount);
    registry.reserve(node, FieldLifecycle.Render, renderHandler);
    registry.reserve(node, FieldLifecycle.Unmount, unmount);
    act(() => view.rerender(tree('hidden')));
    act(() => view.rerender(tree('visible')));
    expect(unmount).toHaveBeenCalledTimes(1);
    expect(mount).not.toHaveBeenCalled();
    expect(renderHandler).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  'isolates handler failures even when error reporters throw=%s',
  (throwReporter) => {
    const error = new Error('lifecycle handler');
    const reported: unknown[] = [];
    const continued = vi.fn(() => FieldLifecycleAction.Focus);
    const host = vi.fn(() => {
      if (throwReporter) throw new Error('host failure');
    });
    vi.stubGlobal('reportError', host);
    const Input = ({ node }: FieldInputProps) => {
      const registry = useFieldLifecycleContext();
      const once = useRef(false);
      if (!once.current) {
        once.current = true;
        registry!.reserve(node, FieldLifecycle.Mount, () => {
          throw error;
        });
        registry!.reserve(node, FieldLifecycle.Mount, continued);
      }
      return <input aria-label="surviving input" />;
    };
    const view = render(
      <Form
        jsonSchema={{ type: 'string', presentation: { FieldInput: Input } }}
        onError={(record) => {
          if (record.code !== FormErrorCode.ListenerThrew) return;
          reported.push(record);
          if (throwReporter) throw new Error('consumer reporter failure');
        }}
      />,
    );
    expect(reported).toEqual([
      expect.objectContaining({
        error,
        origin: 'render',
        code: FormErrorCode.ListenerThrew,
        path: '',
      }),
    ]);
    expect(continued).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(view.getByLabelText('surviving input'));
    expect(host).toHaveBeenCalledTimes(throwReporter ? 1 : 0);
  },
);

it('calls the composition cleanup and restores command subscriptions on effect reconnect', () => {
  const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const registry = new FieldLifecycleRegistry(vi.fn());
  const release = vi.fn();
  const Host = () => {
    const ref = useRef<HTMLDivElement>(null);
    useFieldLifecycle(node, ref, noop, release, undefined, null, registry);
    return (
      <div ref={ref}>
        <input />
      </div>
    );
  };
  const view = render(<Host />, { reactStrictMode: true });
  expect(release).toHaveBeenCalledTimes(1);
  act(() => node.request(FieldNodeRequestType.Focus));
  expect(document.activeElement).toBe(view.container.querySelector('input'));
  view.unmount();
  expect(release).toHaveBeenCalledTimes(2);
});

it.skipIf(!React.Activity)(
  'Activity reconnect applies a composition-deferred Refresh without compositionend',
  () => {
    const handle = React.createRef<FormHandle>();
    const Input = ({ value }: FieldInputProps) => (
      <input defaultValue={String(value ?? '')} />
    );
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input },
    } as const;
    const tree = (mode: 'visible' | 'hidden') => (
      <React.Activity mode={mode}>
        <Form ref={handle} jsonSchema={schema} defaultValue="committed" />
      </React.Activity>
    );
    const view = render(tree('visible'));
    const input = view.container.querySelector('input')!;
    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: '조합 중' } });
    act(() => {
      handle.current!.refresh();
      handle.current!.refresh();
    });
    expect(view.container.querySelector('input')).toBe(input);
    expect(input.value).toBe('조합 중');
    act(() => view.rerender(tree('hidden')));
    act(() => view.rerender(tree('visible')));
    const replacement = view.container.querySelector('input')!;
    expect(replacement).not.toBe(input);
    expect(replacement.value).toBe('committed');
    expect(handle.current!.getValue()).toBe('committed');
  },
);
