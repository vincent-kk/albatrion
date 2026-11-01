import { Fragment, StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { type FieldNode, ValidationMode } from '@/schema-form/core';

import { useFieldNode } from '../fieldNode/useFieldNode';

afterEach(cleanup);

/** Read the engine's existing subscriber sets without adding an observer. */
const listenersOf = (node: FieldNode): number => {
  const listeners = Reflect.get(Reflect.get(node, 'runtime'), 'listeners');
  return listeners instanceof Map ? (listeners.get(node)?.size ?? 0) : 0;
};

/** Resolve a path through the production hook without adding tracker listeners. */
const Probe = ({ input }: { input?: FieldNode | string }) => {
  const node = useFieldNode(input);
  return <output>{String(node?.value)}</output>;
};

it.each([false, true])(
  'DR-9 releases every path-prefix listener (StrictMode=%s)',
  (strict) => {
    const ref = createRef<FormHandle>();
    const Wrapper = strict ? StrictMode : Fragment;
    const schema = {
      type: 'object',
      properties: { items: { type: 'array', items: { type: 'string' } } },
    } as const;
    const view = render(
      <Wrapper>
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue={{ items: ['first', 'second'] }}
          validationMode={ValidationMode.None}
        >
          <span />
        </Form>
      </Wrapper>,
    );
    const root = ref.current!.node!;
    const items = root.find('/items')!;
    const first = root.find('/items/0')!;
    const before = [root, items, first].map(listenersOf);
    view.rerender(
      <Wrapper>
        <Form
          ref={ref}
          jsonSchema={schema}
          validationMode={ValidationMode.None}
        >
          <Probe input="/items/0" />
        </Form>
      </Wrapper>,
    );
    expect([root, items, first].map(listenersOf)).toEqual(
      before.map((count) => count + 1),
    );
    view.rerender(
      <Wrapper>
        <Form
          ref={ref}
          jsonSchema={schema}
          validationMode={ValidationMode.None}
        >
          <span />
        </Form>
      </Wrapper>,
    );
    expect([root, items, first].map(listenersOf)).toEqual(before);
  },
);

it('DR-9 node and root inputs add no path listeners', () => {
  const ref = createRef<FormHandle>();
  const schema = { type: 'string' } as const;
  const view = render(
    <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  const root = ref.current!.node!;
  const before = listenersOf(root);
  view.rerender(
    <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
      <Probe input={root} />
      <Probe />
      <Probe input="#" />
    </Form>,
  );
  expect(listenersOf(root)).toBe(before);
});

it('DR-9 default root proxy retains its four listeners', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
    />,
  );
  expect(listenersOf(ref.current!.node!)).toBe(4);
});

it.skipIf(inject('reactMajor') !== '18')(
  'DR-9 React18 legacy root reattaches safely during a synchronous wave and releases listeners',
  () => {
    const ref = createRef<FormHandle>();
    const view = render(
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={{ type: 'array', items: { type: 'string' } }}
          defaultValue={['first', 'second']}
          validationMode={ValidationMode.None}
        >
          <Probe input="/0" />
        </Form>
      </StrictMode>,
      { legacyRoot: true },
    );
    const root = ref.current!.node!;
    if (root.type !== 'array') throw new Error('Expected array');
    expect(listenersOf(root)).toBe(2);
    act(() => root.remove(0));
    expect(view.container.querySelector('output')?.textContent).toBe('second');
    expect(listenersOf(root)).toBe(2);
    const remaining = root.find('/0')!;
    expect(listenersOf(remaining)).toBe(1);
    view.unmount();
    expect(listenersOf(root)).toBe(1);
    expect(listenersOf(remaining)).toBe(0);
  },
);
