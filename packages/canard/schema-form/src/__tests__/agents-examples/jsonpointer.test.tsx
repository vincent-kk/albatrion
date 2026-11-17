import { type ComponentType, type RefObject, createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldNode,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@/schema-form';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: { name: { type: 'string' }, sibling: { type: 'string' } },
    },
    items: { type: 'array', items: { type: 'string' } },
  },
} satisfies JSONSchema;

// prettier-ignore
function runFindExamples(
  rootNode: FieldNode,
  currentNode: FieldNode,
  formRef: RefObject<FormHandle | null>,
) {
rootNode.find('/user/name'); // absolute
currentNode.find('../sibling'); // parent-relative
currentNode.find('..'); // parent itself
formRef.current?.findNodes('/items/*'); // all wildcard matches need the plural form
}

it('resolves absolute, parent-relative and wildcard lookups as documented', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ user: { name: 'Ada' }, items: ['a', 'b'] }}
    />,
  );
  const root = ref.current!.node!;
  const name = ref.current!.findNode('/user/name')!;
  const rootFind = vi.spyOn(root, 'find');
  const nameFind = vi.spyOn(name, 'find');
  const findNodes = vi.spyOn(ref.current!, 'findNodes');
  runFindExamples(root, name, ref);
  expect(rootFind.mock.results[0].value).toBe(name);
  expect(nameFind.mock.results[0].value).toBe(
    ref.current!.findNode('/user/sibling'),
  );
  expect(nameFind.mock.results[1].value).toBe(ref.current!.findNode('/user'));
  expect(findNodes.mock.results[0].value).toHaveLength(2);
  expect(root.find('/items/*')).not.toBe(findNodes.mock.results[0].value);
  expect(Array.isArray(root.find('/items/*'))).toBe(false);
});

const escapedSchema = {
  type: 'object',
  properties: {
    'object/Node': { type: 'string' },
    'tilde~here': { type: 'string' },
  },
} satisfies JSONSchema;

// prettier-ignore
function runEscapingExamples(
  SpecialInput: ComponentType<FieldInputProps>,
  rootNode: FieldNode,
) {
// property name: 'object/Node'
const fieldInputMap = { '/object~1Node': SpecialInput };
// property name: 'tilde~here'
rootNode.find('/tilde~0here');
  return fieldInputMap;
}

/** Marks the input chosen for the escaped property. */
function SpecialInput({ value }: FieldInputProps) {
  return <output aria-label="Special">{String(value)}</output>;
}

it('escapes ~1 and ~0 in fieldInputMap keys and in find', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={escapedSchema}
      defaultValue={{ 'object/Node': 'slash', 'tilde~here': 'tilde' }}
    />,
  );
  const root = ref.current!.node!;
  const find = vi.spyOn(root, 'find');
  const fieldInputMap = runEscapingExamples(SpecialInput, root);
  const found = find.mock.results[0].value as FieldNode;
  expect(found).toBe(ref.current!.findNode('/tilde~0here'));
  expect(found.value).toBe('tilde');
  view.unmount();
  const mapped = render(
    <Form
      jsonSchema={escapedSchema}
      defaultValue={{ 'object/Node': 'slash', 'tilde~here': 'tilde' }}
      fieldInputMap={fieldInputMap}
    />,
  );
  expect(mapped.getByLabelText('Special').textContent).toBe('slash');
  expect(mapped.getAllByRole('textbox')).toHaveLength(1);
});
