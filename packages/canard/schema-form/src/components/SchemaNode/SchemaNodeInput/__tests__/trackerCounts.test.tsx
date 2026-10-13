import { Profiler, createRef, useLayoutEffect, useMemo, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import {
  SchemaNodeEventType,
  SchemaNodeRequestType,
  isArrayNode,
  nodeFromJSONSchema,
} from '@/schema-form/core';
import type { FormTypeInputProps } from '@/schema-form/types';

import { useFormTypeInputControl } from '../hooks/useFormTypeInputControl';
import { REACTIVE_RERENDERING_EVENTS } from '../type';

/** Runtime snapshot mask for the input's props, child list and applied Refresh. */
const INPUT_TRACKING_EVENTS =
  REACTIVE_RERENDERING_EVENTS |
  SchemaNodeEventType.UpdateChildren |
  SchemaNodeEventType.RequestRefresh;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Commit marker for a host that renders no terminal read detector. */
const noTerminalChildren = () => {};

it('F-E retains four listeners per field and unchanged input renders with Refresh, focus and select', () => {
  const probe = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const prototype = Object.getPrototypeOf(probe);
  const subscribe = prototype.subscribe;
  const active = new Map<object, number>();
  vi.spyOn(prototype, 'subscribe').mockImplementation(function (
    this: object,
    ...args: unknown[]
  ) {
    active.set(this, (active.get(this) ?? 0) + 1);
    const unsubscribe = subscribe.apply(this, args);
    return () => {
      active.set(this, active.get(this)! - 1);
      unsubscribe();
    };
  });
  const ref = createRef<FormHandle>();
  const renders = vi.fn();
  let change!: FormTypeInputProps['onChange'];
  const Input = (props: FormTypeInputProps) => {
    renders(props.value);
    change = props.onChange;
    return <input defaultValue={props.defaultValue} id={props.path} />;
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { field: { type: 'string' } } }}
      defaultValue={{ field: 'first' }}
      formTypeInputDefinitions={[
        { test: { type: 'string' }, Component: Input },
      ]}
    />,
  );
  const node = ref.current!.findNode('/field')!;
  const initialListeners = active.get(node);
  const revision = vi.spyOn(node, 'revision');
  expect(renders).toHaveBeenCalledTimes(1);
  act(() => change('typed'));
  expect(renders).toHaveBeenCalledTimes(2);
  const initial = view.container.querySelector('input')!;
  act(() => ref.current!.refresh('/field'));
  const refreshed = view.container.querySelector('input')!;
  expect(refreshed).not.toBe(initial);
  expect(refreshed.value).toBe('typed');
  expect(renders).toHaveBeenCalledTimes(3);
  act(() => ref.current!.focus('/field'));
  expect(document.activeElement).toBe(refreshed);
  act(() => ref.current!.select('/field'));
  expect(refreshed.selectionStart).toBe(0);
  expect(refreshed.selectionEnd).toBe(5);
  expect(renders).toHaveBeenCalledTimes(3);
  expect(initialListeners).toBe(4);
  expect(active.get(node)).toBe(4);
  expect(revision).toHaveBeenCalledWith(INPUT_TRACKING_EVENTS);
  expect(revision).not.toHaveBeenCalledWith(
    INPUT_TRACKING_EVENTS & ~SchemaNodeEventType.RequestRefresh,
  );
  view.unmount();
  expect(active.get(node)).toBe(0);
});

it('F-E keeps one container render per array write through the last removal and still applies the next Refresh', () => {
  const ref = createRef<FormHandle>();
  const renders = vi.fn();
  const Container = ({ ChildNodeComponents }: FormTypeInputProps) => {
    renders();
    return (
      <section>
        {ChildNodeComponents.map((Child) => (
          <Child key={Child.key} />
        ))}
      </section>
    );
  };
  const view = render(
    <Form
      validationMode={0}
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { items: { type: 'array', items: { type: 'string' } } },
      }}
      defaultValue={{ items: [] }}
      formTypeInputDefinitions={[
        { test: { type: 'array' }, Component: Container },
      ]}
    />,
  );
  const node = ref.current!.findNode('/items')!;
  if (!isArrayNode(node)) throw new Error('Expected an array input');
  const revision = vi.spyOn(node, 'revision');
  expect(renders).toHaveBeenCalledTimes(1);
  act(() => node.push('a'));
  expect(renders).toHaveBeenCalledTimes(2);
  act(() => node.push('b'));
  expect(renders).toHaveBeenCalledTimes(3);
  act(() => node.remove(0));
  expect(renders).toHaveBeenCalledTimes(4);
  act(() => node.remove(0));
  expect(renders).toHaveBeenCalledTimes(5);
  const empty = view.container.querySelector('section');
  act(() => ref.current!.refresh('/items'));
  expect(renders).toHaveBeenCalledTimes(6);
  expect(view.container.querySelector('section')).not.toBe(empty);
  expect(revision).toHaveBeenCalledWith(INPUT_TRACKING_EVENTS);
});

it.each(['UpdateChildren', 'UpdateValue'] as const)(
  'F-E catches up %s delivered after render and before subscribe through the combined snapshot',
  (event) => {
    let delivered = false;
    let deliveredRevision = 0;
    let tracking = false;
    const masks: (number | undefined)[] = [];
    const Input = ({
      node,
      value,
      onChange,
      ChildNodeComponents,
    }: FormTypeInputProps) => {
      const subscribe = useMemo(() => vi.spyOn(node, 'subscribe'), [node]);
      if (!tracking) {
        tracking = true;
        const readRevision = node.revision.bind(node);
        vi.spyOn(node, 'revision').mockImplementation((mask) => {
          masks.push(mask);
          return readRevision(mask);
        });
      }
      useLayoutEffect(() => {
        if (delivered) return;
        delivered = true;
        expect(subscribe).not.toHaveBeenCalled();
        const tracking = SchemaNodeEventType[event];
        const before = node.revision(tracking);
        if (event === 'UpdateChildren') {
          if (!isArrayNode(node)) throw new Error('Expected an array input');
          node.push('landed');
        } else onChange('landed');
        deliveredRevision = node.revision(tracking);
        expect(deliveredRevision).toBeGreaterThan(before);
        expect(subscribe).not.toHaveBeenCalled();
      }, [node, onChange, subscribe]);
      return (
        <output data-testid="snapshot">
          {event === 'UpdateChildren' ? ChildNodeComponents.length : value}
        </output>
      );
    };
    const view = render(
      <Form
        validationMode={0}
        jsonSchema={
          event === 'UpdateChildren'
            ? { type: 'array', items: { type: 'string' } }
            : { type: 'string' }
        }
        formTypeInputDefinitions={[
          {
            test: { type: event === 'UpdateChildren' ? 'array' : 'string' },
            Component: Input,
          },
        ]}
      />,
    );
    expect(deliveredRevision).toBeGreaterThan(0);
    const output = view.getByTestId('snapshot');
    expect(output.textContent).toBe(
      event === 'UpdateChildren' ? '1' : 'landed',
    );
    expect(masks).toContain(INPUT_TRACKING_EVENTS);
  },
);

it('F-E applies coalesced child-owned Refresh once on the next delivery after child proxies unmount', () => {
  const mounts = vi.fn();
  const unmounts = vi.fn();
  const Container = ({ ChildNodeComponents }: FormTypeInputProps) => {
    const [visible, setVisible] = useState(true);
    useLayoutEffect(() => {
      mounts();
      return () => {
        unmounts();
      };
    }, []);
    return (
      <section>
        <button onClick={() => setVisible(false)}>hide children</button>
        {visible &&
          ChildNodeComponents.map((Child) => <Child key={Child.key} />)}
      </section>
    );
  };
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      validationMode={0}
      jsonSchema={{ type: 'object', properties: { name: { type: 'string' } } }}
      formTypeInputDefinitions={[
        { test: { type: 'object' }, Component: Container },
      ]}
    />,
  );
  const node = ref.current!.node!;
  const revision = vi.spyOn(node, 'revision');
  const original = view.container.querySelector('section');
  const generation = node.revision(SchemaNodeEventType.RequestRefresh);
  act(() => {
    ref.current!.refresh();
    ref.current!.refresh();
  });
  expect(node.revision(SchemaNodeEventType.RequestRefresh)).toBe(
    generation + 2,
  );
  expect(view.container.querySelector('section')).toBe(original);
  expect(mounts).toHaveBeenCalledTimes(1);
  expect(unmounts).not.toHaveBeenCalled();
  expect(revision).toHaveBeenCalledWith(
    INPUT_TRACKING_EVENTS & ~SchemaNodeEventType.RequestRefresh,
  );
  expect(revision).not.toHaveBeenCalledWith(INPUT_TRACKING_EVENTS);
  fireEvent.click(view.getByText('hide children'));
  expect(view.container.querySelector('input')).toBeNull();
  expect(view.container.querySelector('section')).toBe(original);
  expect(mounts).toHaveBeenCalledTimes(1);
  act(() => node.setState({ 2: true }));
  expect(view.container.querySelector('section')).not.toBe(original);
  expect(view.container.querySelector('input')).not.toBeNull();
  expect(mounts).toHaveBeenCalledTimes(2);
  expect(unmounts).toHaveBeenCalledTimes(1);
  expect(revision).toHaveBeenCalledWith(INPUT_TRACKING_EVENTS);
  act(() => node.setState({ 2: false }));
  expect(mounts).toHaveBeenCalledTimes(2);
  expect(unmounts).toHaveBeenCalledTimes(1);
});

it('F-E applies deferred Refresh once on a parent-driven render after child proxies unmount', () => {
  const renders = vi.fn();
  const mounts = vi.fn();
  const unmounts = vi.fn();
  const Container = ({ ChildNodeComponents, readOnly }: FormTypeInputProps) => {
    renders(readOnly);
    const [visible, setVisible] = useState(true);
    useLayoutEffect(() => {
      mounts();
      return () => {
        unmounts();
      };
    }, []);
    return (
      <section data-readonly={String(readOnly)}>
        <button onClick={() => setVisible(false)}>hide children</button>
        {visible &&
          ChildNodeComponents.map((Child) => <Child key={Child.key} />)}
      </section>
    );
  };
  const ref = createRef<FormHandle>();
  const jsonSchema = {
    type: 'object',
    properties: { name: { type: 'string' } },
  } as const;
  const definitions = [
    { test: { type: 'object' as const }, Component: Container },
  ];
  const defaultValue = { name: 'initial' };
  const form = (readOnly: boolean) => (
    <Form
      ref={ref}
      validationMode={0}
      jsonSchema={jsonSchema}
      defaultValue={defaultValue}
      formTypeInputDefinitions={definitions}
      readOnly={readOnly}
    />
  );
  const view = render(form(false));
  const node = ref.current!.node!;
  const original = view.container.querySelector('section');
  const initialRenders = renders.mock.calls.length;
  act(() => {
    ref.current!.refresh();
    ref.current!.refresh();
  });
  expect(renders).toHaveBeenCalledTimes(initialRenders);
  fireEvent.click(view.getByText('hide children'));
  expect(view.container.querySelector('input')).toBeNull();
  expect(view.container.querySelector('section')).toBe(original);
  expect(renders).toHaveBeenCalledTimes(initialRenders + 1);
  expect(mounts).toHaveBeenCalledTimes(1);
  expect(unmounts).not.toHaveBeenCalled();
  const revision = node.revision();
  view.rerender(form(true));
  expect(node.revision()).toBe(revision);
  const refreshed = view.container.querySelector('section');
  expect(refreshed).not.toBe(original);
  expect(refreshed!.getAttribute('data-readonly')).toBe('true');
  expect(view.container.querySelector('input')).not.toBeNull();
  expect(renders).toHaveBeenCalledTimes(initialRenders + 2);
  expect(mounts).toHaveBeenCalledTimes(2);
  expect(unmounts).toHaveBeenCalledTimes(1);
  view.rerender(form(false));
  expect(node.revision()).toBe(revision);
  expect(view.container.querySelector('section')).toBe(refreshed);
  expect(renders).toHaveBeenCalledTimes(initialRenders + 3);
  expect(mounts).toHaveBeenCalledTimes(2);
  expect(unmounts).toHaveBeenCalledTimes(1);
});

it('F-E defers a child-layout Refresh at subscribe without an extra caller render', () => {
  const mountRenderCounts: number[] = [];
  for (const requestRefresh of [false, true]) {
    const renders = vi.fn();
    const callerRenders = vi.fn();
    const mounts = vi.fn();
    const unmounts = vi.fn();
    const node = nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: { name: { type: 'string' } } },
    });
    const mountedChildren = { current: 0 };
    const subscribe = vi.spyOn(node, 'subscribe');
    let delivered = false;
    const ChildInput = () => {
      useLayoutEffect(() => {
        mountedChildren.current++;
        if (requestRefresh && !delivered) {
          delivered = true;
          expect(renders).toHaveBeenCalledTimes(1);
          expect(subscribe).not.toHaveBeenCalled();
          const revision = node.revision(SchemaNodeEventType.RequestRefresh);
          node.request(SchemaNodeRequestType.Refresh);
          expect(node.revision(SchemaNodeEventType.RequestRefresh)).toBe(
            revision + 1,
          );
          expect(subscribe).not.toHaveBeenCalled();
        }
        return () => {
          mountedChildren.current--;
        };
      }, []);
      return <input aria-label="child" />;
    };
    const Container = () => {
      renders();
      const [visible, setVisible] = useState(true);
      useLayoutEffect(() => {
        mounts();
        return () => {
          unmounts();
        };
      }, []);
      return (
        <section>
          <button onClick={() => setVisible(false)}>hide children</button>
          {visible && <ChildInput />}
        </section>
      );
    };
    const Host = () => {
      callerRenders();
      const [ref, generation] = useFormTypeInputControl(
        node,
        mountedChildren,
        noTerminalChildren,
      );
      return (
        <div ref={ref}>
          <Container key={generation} />
        </div>
      );
    };
    const view = render(<Host />);
    mountRenderCounts.push(callerRenders.mock.calls.length);
    expect(renders).toHaveBeenCalledTimes(1);
    expect(mounts).toHaveBeenCalledTimes(1);
    expect(unmounts).not.toHaveBeenCalled();
    expect(mountedChildren.current).toBe(1);
    expect(view.getByLabelText('child')).not.toBeNull();
    if (requestRefresh) {
      expect(delivered).toBe(true);
      const original = view.container.querySelector('section');
      fireEvent.click(view.getByText('hide children'));
      expect(view.queryByLabelText('child')).toBeNull();
      expect(mountedChildren.current).toBe(0);
      expect(view.container.querySelector('section')).toBe(original);
      expect(mounts).toHaveBeenCalledTimes(1);
      act(() => node.setState({ 2: true }));
      const refreshed = view.container.querySelector('section');
      expect(refreshed).not.toBe(original);
      expect(view.getByLabelText('child')).not.toBeNull();
      expect(mounts).toHaveBeenCalledTimes(2);
      expect(unmounts).toHaveBeenCalledTimes(1);
      act(() => node.setState({ 2: false }));
      expect(view.container.querySelector('section')).toBe(refreshed);
      expect(mounts).toHaveBeenCalledTimes(2);
      expect(unmounts).toHaveBeenCalledTimes(1);
    }
    view.unmount();
  }
  expect(mountRenderCounts).toEqual([1, 1]);
});

it('F-E preserves 202 array-push-remove-100 commits and reads the next Refresh in one snapshot', () => {
  const ref = createRef<FormHandle>();
  const commits = vi.fn();
  render(
    <Profiler id="array-push-remove-100" onRender={commits}>
      <Form
        ref={ref}
        validationMode={0}
        jsonSchema={{
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  active: { type: 'boolean' },
                },
              },
            },
          },
        }}
      />
    </Profiler>,
  );
  const node = ref.current!.findNode('/items')!;
  if (!isArrayNode(node)) throw new Error('Expected an array input');
  const revision = vi.spyOn(node, 'revision');
  for (let index = 0; index < 100; index++)
    act(() =>
      node.push({
        id: `s-${index}`,
        name: `item-${index}`,
        active: index % 2 === 0,
      }),
    );
  for (let index = 99; index >= 0; index--) act(() => node.remove(index));
  expect(node.value).toEqual([]);
  expect(commits).toHaveBeenCalledTimes(202);
  act(() => ref.current!.refresh('/items'));
  expect(revision).toHaveBeenCalledWith(INPUT_TRACKING_EVENTS);
});
