import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  FormProvider,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    a: { type: 'string', default: 'A' },
    b: { type: 'string', default: 'B' },
  },
} as const;

it('Form.Input follows a changed path prop and writes to the new field', async () => {
  const ref = createRef<FormHandle>();
  const user = userEvent.setup();
  const tree = (path: string) => (
    <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
      <Form.Label path={path} />
      <Form.Input path={path} />
    </Form>
  );
  const view = render(tree('/a'));
  view.rerender(tree('/b'));
  const input = view.container.querySelector('input') as HTMLInputElement;
  expect(input.id).toBe('/b');
  expect(input.value).toBe('B');
  expect(view.container.querySelector('label')?.getAttribute('for')).toBe(
    '/b',
  );
  await user.clear(input);
  await user.type(input, 'x');
  expect(ref.current!.getValue()).toEqual({ a: 'A', b: 'x' });
});

it('Form.Render follows a changed path prop', async () => {
  const tree = (path: string) => (
    <Form jsonSchema={schema} validationMode={ValidationMode.None}>
      <Form.Render path={path}>
        {({ value, path: p }) => <output>{`${p}=${String(value)}`}</output>}
      </Form.Render>
    </Form>
  );
  const view = render(tree('/a'));
  expect(view.container.querySelector('output')?.textContent).toBe('/a=A');
  view.rerender(tree('/b'));
  expect(view.container.querySelector('output')?.textContent).toBe('/b=B');
});

const Mark =
  (tag: string) =>
  ({ path }: FieldInputProps) => <i data-src={tag}>{path}</i>;
const P = Mark('plugin');

it('FieldInput priority: presentation > fieldInputMap > Form definitions > provider definitions', () => {
  const sch = {
    type: 'object',
    properties: {
      inline: { type: 'string', presentation: { FieldInput: Mark('inline') } },
      mapped: { type: 'string' },
      formDef: { type: 'string', format: 'x' },
      provDef: { type: 'string', format: 'y' },
    },
  } as const;
  const view = render(
    <FormProvider
      fieldInputDefinitions={[
        { test: { type: 'string' }, Component: Mark('provider') },
      ]}
    >
      <Form
        jsonSchema={sch as any}
        validationMode={ValidationMode.None}
        fieldInputMap={{ '/inline': Mark('map'), '/mapped': Mark('map') }}
        fieldInputDefinitions={[
          { test: { format: 'x' }, Component: Mark('form') },
        ]}
      />
    </FormProvider>,
  );
  void P;
  const src = Object.fromEntries(
    [...view.container.querySelectorAll('i')].map((el) => [
      el.textContent,
      el.getAttribute('data-src'),
    ]),
  );
  expect(src).toEqual({
    '/inline': 'inline',
    '/mapped': 'map',
    '/formDef': 'form',
    '/provDef': 'provider',
  });
});

it('Form.Input FieldInput prop changes after mount are ignored only when documented (captured at mount)', async () => {
  const tree = (C: any) => (
    <Form jsonSchema={schema} validationMode={ValidationMode.None}>
      <Form.Input path="/a" FieldInput={C} />
    </Form>
  );
  const view = render(tree(Mark('one')));
  view.rerender(tree(Mark('two')));
  await act(async () => {});
  // Documented: captured at mount.
  expect(view.container.querySelector('i')?.getAttribute('data-src')).toBe(
    'one',
  );
});
