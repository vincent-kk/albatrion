import { createRef, useEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type ArrayNode,
  type FieldInputProps,
  type FieldNode,
  FieldNodeEventType,
  Form,
  type FormHandle,
} from '@/schema-form';

/** Mounts the documented subscription for one node.
 * @param props - The node whose events the effect watches.
 * @returns Nothing; the effect is the example. */
function Watcher({ node }: { node: FieldNode }) {
  useEffect(
    () =>
      node.subscribe(({ type }) => {
        if (type & FieldNodeEventType.UpdateValue) {
          // the event type is a bit mask; one delivery may merge several bits
        }
      }),
    [node],
  ); // subscribe returns its own cleanup
  return null;
}

/** Branch array input that only lays out the item inputs.
 * @param props - FieldInput props supplied by Form.
 * @returns One slot per item node. */
function ListInput({ ChildFields }: FieldInputProps) {
  return (
    <>
      {ChildFields.map((Child, index) => (
        <Child key={index} />
      ))}
    </>
  );
}

afterEach(cleanup);

it('delivers a bit mask that merges several events and returns its own cleanup', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      fieldInputDefinitions={[
        { test: { type: 'array' }, Component: ListInput },
      ]}
    />,
  );
  await act(async () => {});
  const node = ref.current!.findNode('') as ArrayNode;

  const cleanups: Array<() => void> = [];
  const delivered: number[] = [];
  const subscribe = node.subscribe.bind(node);
  vi.spyOn(node, 'subscribe').mockImplementation((listener) => {
    const off = subscribe((event) => {
      delivered.push(event.type);
      listener(event);
    });
    const cleanup = vi.fn(off);
    cleanups.push(cleanup);
    return cleanup;
  });

  const view = render(<Watcher node={node} />);
  expect(node.subscribe).toHaveBeenCalledTimes(1);

  act(() => {
    node.push('a');
  });
  expect(delivered).toHaveLength(1);
  expect(delivered[0] & FieldNodeEventType.UpdateValue).toBeTruthy();
  expect(delivered[0] & FieldNodeEventType.UpdateChildren).toBeTruthy();
  expect(delivered[0]).not.toBe(FieldNodeEventType.UpdateValue);

  expect(cleanups[0]).not.toHaveBeenCalled();
  view.unmount();
  expect(cleanups[0]).toHaveBeenCalledTimes(1);
  act(() => {
    node.push('b');
  });
  expect(delivered).toHaveLength(1);
});
