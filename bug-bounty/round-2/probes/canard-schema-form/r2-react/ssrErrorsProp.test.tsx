import { createRef } from 'react';

import { act } from '@testing-library/react';
import { type Root, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

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

it('server rendering shows the errors prop message under ErrorVisibility.Always', () => {
  const html = renderToString(
    <Form
      jsonSchema={schema}
      errors={serverErrors as any}
      errorVisibility={ErrorVisibility.Always}
      validationMode={ValidationMode.None}
    >
      <Form.Input path="/name" />
      <Form.ErrorMessage path="/name" />
    </Form>,
  );
  expect(html).toContain('This name is taken.');
});

it('server rendering passes the errors prop to function children', () => {
  const html = renderToString(
    <Form
      jsonSchema={schema}
      errors={serverErrors as any}
      validationMode={ValidationMode.None}
    >
      {({ errors }) => <output>{String(errors?.length ?? 0)}</output>}
    </Form>,
  );
  expect(html).toContain('<output>1</output>');
});

it('first client render (before effects) already sees the errors prop: handle.getErrors in a child render', async () => {
  // Control: after hydration the errors are present, so the server HTML differs from the settled client HTML.
  const container = document.createElement('div');
  document.body.append(container);
  const ref = createRef<FormHandle>();
  const element = (
    <Form
      ref={ref}
      jsonSchema={schema}
      errors={serverErrors as any}
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

it('server rendering a Form logs no React warnings (useLayoutEffect on the server)', () => {
  const spy = console.error as unknown as { mock: { calls: unknown[][] } };
  renderToString(
    <Form jsonSchema={schema} validationMode={ValidationMode.None} />,
  );
  const warnings = spy.mock.calls
    .map((c) => String(c[0]).split('\n')[0])
    .filter((m) => m.includes('useLayoutEffect'));
  expect(warnings).toEqual([]);
});
