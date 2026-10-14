import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type {
  FieldInputDefinition,
  FieldInputHint,
  FieldInputProps,
} from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('REACT-012 REACT-032 passes integer kind and effective schema through FieldInputHint and input props', () => {
  const test = vi.fn((_hint: FieldInputHint) => true);
  const Input = vi.fn((props: FieldInputProps) => (
    <span>
      {props.type}:{String(props.schemaType)}
    </span>
  ));
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'integer' }}
      fieldInputDefinitions={[{ test, Component: Input }]}
    />,
  );
  expect(test.mock.calls[0][0]).toMatchObject({
    type: 'number',
    schemaType: 'integer',
  });
  expect(Input.mock.calls[0][0].jsonSchema).toBe(ref.current!.node!.jsonSchema);
  expect(view.container.textContent).toContain('number:integer');
});

it('REACT-033 ignores unknown test keys and warns once per definition', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const Component = () => <span>selected</span>;
  const definition = {
    test: { type: 'string', typo: 'ignored' },
    Component,
  } as FieldInputDefinition;
  const view = render(
    <Form
      jsonSchema={{ type: 'string' }}
      fieldInputDefinitions={[definition]}
    />,
  );
  expect(view.container.textContent).toContain('selected');
  view.unmount();
  render(
    <Form
      jsonSchema={{ type: 'string' }}
      fieldInputDefinitions={[definition]}
    />,
  );
  expect(
    warning.mock.calls.filter((args) =>
      JSON.stringify(args).includes('FORM_TYPE_TEST_INVALID'),
    ),
  ).toHaveLength(1);
});
