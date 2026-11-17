import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type JSONSchema,
  ValidationMode,
  isTerminalNode,
} from '../../index';

/** Object and nested branch paths expose whether an ancestor map captures children. */
const schema: JSONSchema = {
  type: 'object',
  properties: {
    contact: {
      type: 'object',
      properties: {
        first: { type: 'string' },
        list: { type: 'array', items: { type: 'string' }, default: ['item'] },
        nested: { type: 'object', properties: { name: { type: 'string' } } },
      },
    },
  },
};
/** Preserve branch children and mark every node this input actually owns. */
const Frame = (props: FieldInputProps) => (
  <section data-testid={`frame:${props.path}`}>
    {!isTerminalNode(props.node) &&
      props.ChildFields.map((Child) => <Child key={Child.key} />)}
  </section>
);
/** Identify the default string input separately from the mapped branch. */
const Leaf = ({ path }: FieldInputProps) => <input aria-label={path} />;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('an exact object map leaves its children with their own inputs', () => {
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputMap={{ '/contact': Frame }}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Leaf }]}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByTestId('frame:/contact')).toBeTruthy();
  expect(view.getByLabelText('/contact/first')).toBeTruthy();
  expect(view.getByLabelText('/contact/nested/name')).toBeTruthy();
  expect(view.queryByTestId('frame:/contact/first')).toBeNull();
});

it('an explicit prefix pattern deliberately captures terminal and branch descendants', () => {
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputMap={{ '^/contact': Frame }}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Leaf }]}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByTestId('frame:/contact/first')).toBeTruthy();
  expect(view.getByTestId('frame:/contact/nested')).toBeTruthy();
  expect(view.getByTestId('frame:/contact/list')).toBeTruthy();
  expect(view.getByTestId('frame:/contact/list/0')).toBeTruthy();
  expect(view.getByTestId('frame:/contact/nested/name')).toBeTruthy();
  expect(view.queryByLabelText('/contact/first')).toBeNull();
});

it('an earlier exact child key wins over a later descendant pattern', () => {
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputMap={{ '/contact/first': Leaf, '^/contact/': Frame }}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByLabelText('/contact/first')).toBeTruthy();
  expect(view.getByTestId('frame:/contact/nested/name')).toBeTruthy();
});

it('an earlier pattern wins over a later exact key regardless of kind', () => {
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputMap={{ '^/contact/': Frame, '/contact/first': Leaf }}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByTestId('frame:/contact/first')).toBeTruthy();
  expect(view.queryByLabelText('/contact/first')).toBeNull();
});

it('a plain parent key no longer consumes an overlapping child key', () => {
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputMap={{ '/contact': Frame, '/contact/first': Leaf }}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByLabelText('/contact/first')).toBeTruthy();
});

it('literal double stars and brackets apply without reporting or logging an error', () => {
  const warning = vi.spyOn(console, 'warn');
  const error = vi.spyOn(console, 'error');
  const info = vi.spyOn(console, 'info');
  const onError = vi.fn();
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { '**': { type: 'string' }, 'price[': { type: 'string' } },
      }}
      fieldInputMap={{ '/**': Leaf, '/price[': Leaf }}
      onError={onError}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByLabelText('/**')).toBeTruthy();
  expect(view.getByLabelText('/price[')).toBeTruthy();
  expect(onError).not.toHaveBeenCalled();
  expect(warning).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  expect(info).not.toHaveBeenCalled();
});

it('a mapped branch that omits ChildFields hides its descendants', () => {
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputMap={{ '/contact': () => <div>Hidden branch</div> }}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Leaf }]}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByText('Hidden branch')).toBeTruthy();
  expect(view.queryByLabelText('/contact/first')).toBeNull();
});

it('a definition predicate can select leaf fields without replacing branches', () => {
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={[
        {
          test: (hint) =>
            hint.type === 'string' && hint.path.startsWith('/contact/'),
          Component: Leaf,
        },
      ]}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByLabelText('/contact/first')).toBeTruthy();
  expect(view.getByLabelText('/contact/nested/name')).toBeTruthy();
});
