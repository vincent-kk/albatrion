import { createRef } from 'react';

import { act, render } from '@testing-library/react';
import { type Root, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

const schema = {
  type: 'object',
  properties: { name: { type: 'string', default: 'taken' } },
} as const;

const serverErrors = [
  { dataPath: '/name', keyword: 'server', message: 'This name is taken.' },
];

let root: Root | undefined;
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  vi.restoreAllMocks();
});

it(
  'round-2 schema-form 6: ' +
    'server rendering shows the errors prop message under ErrorVisibility.Always',
  () => {
    const html = renderToString(
      <Form
        jsonSchema={schema}
        errors={serverErrors}
        errorVisibility={ErrorVisibility.Always}
        validationMode={ValidationMode.None}
      >
        <Form.Input path="/name" />
        <Form.ErrorMessage path="/name" />
      </Form>,
    );
    expect(html).toContain('This name is taken.');
  },
);

it('round-2 schema-form 6: server rendering passes the errors prop to function children', () => {
  const html = renderToString(
    <Form
      jsonSchema={schema}
      errors={serverErrors}
      validationMode={ValidationMode.None}
    >
      {({ errors }) => <output>{String(errors?.length ?? 0)}</output>}
    </Form>,
  );
  expect(html).toContain('<output>1</output>');
});

it('round-2 schema-form 6: first client render (before effects) already sees the errors prop: handle.getErrors in a child render', async () => {
  // Control: after hydration the errors are present, so the server HTML differs from the settled client HTML.
  const container = document.createElement('div');
  document.body.append(container);
  const ref = createRef<FormHandle>();
  const element = (
    <Form
      ref={ref}
      jsonSchema={schema}
      errors={serverErrors}
      errorVisibility={ErrorVisibility.Always}
      validationMode={ValidationMode.None}
    >
      <Form.Input path="/name" />
      <Form.ErrorMessage path="/name" />
    </Form>
  );
  container.innerHTML = renderToString(element);
  const server = container.textContent;
  await act(async () => {
    root = hydrateRoot(container, element);
  });
  expect(ref.current!.getErrors()).toHaveLength(1);
  // The settled client shows the message; the server HTML should already have shown it.
  expect(container.textContent).toContain('This name is taken.');
  expect(server).toBe(container.textContent);
  container.remove();
});

it('round-2 schema-form 6: initial errors add no render or value callback', async () => {
  const run = async (errors?: typeof serverErrors) => {
    let renders = 0;
    const onChange = vi.fn();
    const onValidate = vi.fn();
    const view = render(
      <Form
        jsonSchema={schema}
        errors={errors}
        validationMode={ValidationMode.None}
        onChange={onChange}
        onValidate={onValidate}
      >
        {() => {
          renders++;
          return null;
        }}
      </Form>,
    );
    await act(async () => {});
    const result = {
      renders,
      changes: onChange.mock.calls.length,
      validations: onValidate.mock.calls.length,
    };
    view.unmount();
    return result;
  };
  const without = await run();
  const withErrors = await run(serverErrors);
  expect(withErrors.renders).toBe(without.renders);
  expect(withErrors.changes).toBe(without.changes);
  expect(withErrors.validations).toBe(1);
});
