import { createRef, useLayoutEffect, useReducer } from 'react';

import { act, render } from '@testing-library/react';
import { expect, it } from 'vitest';

import {
  type FieldNode,
  FieldNodeEventType,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@/schema-form';

/** Observe root output/load events and the occurrence's address, then read its current comparison. */
const DivergenceProbe = ({ node }: { node: FieldNode }) => {
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  useLayoutEffect(() => {
    const root = node.rootNode;
    const unsubscribeRoot = root.subscribe(({ type }) => {
      if (
        type &
        (FieldNodeEventType.UpdateValue |
          FieldNodeEventType.UpdateState |
          FieldNodeEventType.RequestRefresh)
      )
        refresh();
    });
    const unsubscribeNode = node.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdatePath) refresh();
    });
    refresh();
    return () => {
      unsubscribeRoot();
      unsubscribeNode();
    };
  }, [node]);
  return <output data-testid="divergence">{String(node.isDivergent)}</output>;
};

it('root output events refresh a trimmed array item with no local value, path or state event', () => {
  const ref = createRef<FormHandle>();
  const schema: JSONSchema = {
    type: 'array',
    items: { type: 'string' },
    options: { omitTrailing: true, omitEmpty: false },
  };
  const view = render(
    <Form ref={ref} jsonSchema={schema} defaultValue={['']} />,
  );
  try {
    const root = ref.current?.node;
    const node = root?.find('/0');
    if (!root || root.type !== 'array' || !node)
      throw new Error('Missing array item');
    const probe = render(<DivergenceProbe node={node} />);
    try {
      expect(probe.getByTestId('divergence').textContent).toBe('false');
      const local: number[] = [];
      const unsubscribe = node.subscribe(({ type }) => local.push(type));
      expect(root.outputValue).toEqual([]);
      act(() => root.push('x'));
      expect(root.outputValue).toEqual([null, 'x']);
      unsubscribe();
      expect(
        local.every(
          (type) =>
            !(
              type &
              (FieldNodeEventType.UpdateValue |
                FieldNodeEventType.UpdatePath |
                FieldNodeEventType.UpdateState)
            ),
        ),
      ).toBe(true);
      expect(probe.getByTestId('divergence').textContent).toBe('true');
    } finally {
      probe.unmount();
    }
  } finally {
    view.unmount();
  }
});

it('root refresh requests observe a same-output reset even with no edited or touched flags', () => {
  const ref = createRef<FormHandle>();
  const schema: JSONSchema = { type: 'string' };
  const view = render(
    <Form ref={ref} jsonSchema={schema} defaultValue="loaded" />,
  );
  try {
    const handle = ref.current;
    if (!handle?.node) throw new Error('Missing node');
    const node = handle.node;
    const probe = render(<DivergenceProbe node={node} />);
    try {
      act(() => handle.setValue('edited'));
      expect(probe.getByTestId('divergence').textContent).toBe('true');
      expect(node.isEdited).toBe(false);
      expect(node.isTouched).toBe(false);
      const events: number[] = [];
      const unsubscribe = node.subscribe(({ type }) => events.push(type));
      view.rerender(
        <Form ref={ref} jsonSchema={schema} defaultValue="edited" />,
      );
      act(() => handle.reset());
      unsubscribe();
      expect(
        events.some((type) => !!(type & FieldNodeEventType.UpdateValue)),
      ).toBe(false);
      expect(
        events.some((type) => !!(type & FieldNodeEventType.RequestRefresh)),
      ).toBe(true);
      expect(probe.getByTestId('divergence').textContent).toBe('false');
    } finally {
      probe.unmount();
    }
  } finally {
    view.unmount();
  }
});
