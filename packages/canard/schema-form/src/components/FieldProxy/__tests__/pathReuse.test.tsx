import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { type FieldNode, ValidationMode } from '@/schema-form/core';
import type { FieldRendererProps } from '@/schema-form/types';

import { FieldProxy } from '../FieldProxy';

afterEach(cleanup);

it('D5 resolves a reused path to the current node after array removal and a forced render', () => {
  const ref = createRef<FormHandle>();
  const observed: FieldNode[] = [];
  const Renderer = vi.fn(({ node }: FieldRendererProps) => {
    observed.push(node);
    return <output>{String(node.value)}</output>;
  });
  const schema = { type: 'array', items: { type: 'string' } } as const;
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={['first', 'second']}
      validationMode={ValidationMode.None}
    >
      <FieldProxy path="/0" FieldRenderer={Renderer} />
    </Form>,
  );
  const root = ref.current!.node!;
  if (root.type !== 'array') throw new Error('Expected array root');
  const removed = root.find('/0');
  expect(observed.at(-1)).toBe(removed);
  act(() => root.remove(0));
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={['first', 'second']}
      validationMode={ValidationMode.None}
    >
      <FieldProxy
        path="/0"
        FieldRenderer={Renderer}
        overridePropsRef={{ current: { title: 'forced' } }}
      />
    </Form>,
  );
  expect(root.find('/0')).not.toBe(removed);
  expect(root.find('/0')?.value).toBe('second');
  expect(observed.at(-1)).toBe(root.find('/0'));
  expect(view.container.querySelector('output')?.textContent).toBe('second');
});
