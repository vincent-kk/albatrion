import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

afterEach(cleanup);

it.each(['remove', 'insert', 'reorder'] as const)(
  'DR-9 Form.Render follows %s without a parent render',
  (operation) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'array', items: { type: 'string' } }}
        defaultValue={['first', 'second']}
        validationMode={ValidationMode.None}
      >
        <Form.Render path="/0">
          {({ node }) => <output>{String(node.value)}</output>}
        </Form.Render>
      </Form>,
    );
    const root = ref.current!.node!;
    if (root.type !== 'array') throw new Error('Expected array root');
    act(() => {
      if (operation === 'remove') root.remove(0);
      else if (operation === 'insert') root.insert(0, 'inserted');
      else {
        const moved = root.remove(1);
        root.insert(0, moved);
      }
    });
    expect(view.container.querySelector('output')?.textContent).toBe(
      operation === 'insert' ? 'inserted' : 'second',
    );
  },
);

it('DR-9 resolves an absent array path after push', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['first', 'second']}
      validationMode={ValidationMode.None}
    >
      <Form.Render path="/2">
        {({ node }) => <output>{String(node.value)}</output>}
      </Form.Render>
    </Form>,
  );
  expect(view.container.querySelector('output')).toBeNull();
  const root = ref.current!.node!;
  if (root.type !== 'array') throw new Error('Expected array root');
  act(() => root.push('third'));
  expect(view.container.querySelector('output')?.textContent).toBe('third');
});

it('DR-9 follows a oneOf replacement under the same property name', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { kind: { type: 'string' } },
        oneOf: [
          {
            controls: { active: './kind === "s"' },
            properties: { value: { type: 'string' } },
          },
          {
            controls: { active: './kind === "n"' },
            properties: { value: { type: 'number' } },
          },
        ],
      }}
      defaultValue={{ kind: 's', value: 'first' }}
      validationMode={ValidationMode.None}
    >
      <Form.Render path="/value">
        {({ node }) => (
          <output>
            {node.type}:{String(node.value)}
          </output>
        )}
      </Form.Render>
    </Form>,
  );
  act(() => ref.current!.setValue({ kind: 'n', value: 42 }));
  expect(view.container.querySelector('output')?.textContent).toBe('number:42');
});
