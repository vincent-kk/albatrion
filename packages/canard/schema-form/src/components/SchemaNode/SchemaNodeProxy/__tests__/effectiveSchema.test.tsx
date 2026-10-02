import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('REACT-012 changes input selection when an active fragment changes only presentation', () => {
  const ref = createRef<FormHandle>();
  const Plain = () => <span>plain-input</span>;
  const Mail = () => <span>mail-input</span>;
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          field: {
            type: 'string',
            allOf: [
              {
                controls: { active: '#/flag' },
                presentation: { formType: 'mail' },
              },
            ],
          },
        },
      }}
      defaultValue={{ flag: false, field: 'a' }}
      formTypeInputDefinitions={[
        { test: { formType: 'mail' }, Component: Mail },
        { test: { type: 'string' }, Component: Plain },
      ]}
    />,
  );
  const field = ref.current!.findNode('/field');
  expect(view.container.textContent).toContain('plain-input');
  act(() => ref.current!.findNode('/flag')!.setValue(true));
  expect(ref.current!.findNode('/field')).toBe(field);
  expect(view.container.textContent).toContain('mail-input');
});

it('ERROR-112 REACT-010 isolates a field formatter failure with the field path', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  const error = new Error('formatter');
  const onError = vi.fn();
  const view = render(
    <Form
      ref={ref}
      onError={onError}
      showError
      jsonSchema={{
        type: 'object',
        properties: { bad: { type: 'string' }, good: { type: 'string' } },
      }}
      errors={[{ dataPath: '/bad', keyword: 'external', message: 'bad' }]}
      formatError={() => {
        throw error;
      }}
    />,
  );
  expect(ref.current!.node).toBeDefined();
  expect(view.container.querySelector('input[name="good"]')).not.toBeNull();
  expect(
    onError.mock.calls.find(([record]) => record.error === error)?.[0],
  ).toMatchObject({ path: '/bad', componentStack: expect.any(String) });
});
