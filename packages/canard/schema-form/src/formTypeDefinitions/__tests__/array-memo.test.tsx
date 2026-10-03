import { createRef } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { nodeFromJSONSchema } from '@/schema-form/core';
import { FormTypeInputArrayDefinition } from '../FormTypeInputArray';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('keeps array rows and buttons without repeating their map on a leaf value update', async () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} jsonSchema={{ type: 'array',
    items: { type: 'string' }, default: ['a', 'b'] }} />);
  await act(async () => {});
  const inputs = [...view.container.querySelectorAll('input')];
  const buttons = [...view.container.querySelectorAll('button')];
  await act(async () => { ref.current!.findNode('/0')!.setValue('next'); });
  expect(view.container.querySelectorAll('input')[0].value).toBe('next');
  expect(view.container.querySelectorAll('input')[1]).toBe(inputs[1]);
  expect([...view.container.querySelectorAll('button')]).toEqual(buttons);
});

it('rebuilds array controls for structure, disabled, readOnly and schema changes', async () => {
  const ref = createRef<FormHandle>();
  const schema = { type: 'array' as const, items: { type: 'string' as const },
    default: ['a'], maxItems: 2 };
  const view = render(<Form ref={ref} jsonSchema={schema} />);
  const first = view.container.querySelector('input');
  await act(async () => { fireEvent.click(view.getByTitle('add item')); });
  expect(view.container.querySelectorAll('input')).toHaveLength(2);
  expect(view.container.querySelector('input')).toBe(first);
  expect(view.queryByTitle('add item')).toBeNull();
  await act(async () => { fireEvent.click(view.getAllByTitle('remove item')[1]); });
  expect(view.container.querySelectorAll('input')).toHaveLength(1);
  view.rerender(<Form ref={ref} jsonSchema={schema} disabled />);
  expect(view.getByTitle('add item').getAttribute('disabled')).not.toBeNull();
  view.rerender(<Form ref={ref} jsonSchema={schema} readOnly />);
  expect(view.queryByTitle('add item')).toBeNull();
  expect(view.queryByTitle('remove item')).toBeNull();
});

it('skips list rendering for value-only props and observes style and schema props', () => {
  const Component = FormTypeInputArrayDefinition.Component;
  const schema = { type: 'array' as const, items: { type: 'string' as const } };
  const node = nodeFromJSONSchema({ jsonSchema: schema, defaultValue: ['a'] });
  const child = vi.fn(() => <span>child</span>);
  const props = { node, jsonSchema: schema, readOnly: false, disabled: false,
    required: false, type: node.type, schemaType: node.schemaType,
    typeMismatch: false, name: '', path: '', nullable: false, errors: [],
    errorVisible: false, watchValues: [], defaultValue: undefined, value: ['a'],
    onChange() {}, onFileAttach() {}, placeholder: undefined, className: undefined,
    style: { gap: 7 }, context: {},
    ChildNodeComponents: [Object.assign(child, { key: 'child', path: '/0', field: '0' })],
  } satisfies ComponentProps<typeof Component>;
  const view = render(<Component {...props} />);
  const calls = child.mock.calls.length;
  view.rerender(<Component {...props} value={['b']} />);
  expect(child).toHaveBeenCalledTimes(calls);
  view.rerender(<Component {...props} style={{ gap: 11 }} />);
  expect((view.container.firstChild as HTMLElement).style.gap).toBe('11px');
  expect(child.mock.calls.length).toBeGreaterThan(calls);
  view.rerender(<Component {...props} jsonSchema={{ ...schema, maxItems: 1 }} />);
  expect(view.queryByTitle('add item')).toBeNull();
});
