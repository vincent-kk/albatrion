import { StrictMode, createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('LANDING-075 ERROR-077 ERROR-079 keeps an expression-failed mount visible and degraded', async () => {
  const sink = vi.fn();
  vi.stubGlobal('reportError', sink);
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  render(
    <StrictMode>
      <Form
        ref={ref}
        onError={onError}
        jsonSchema={{
          type: 'string',
          controls: { derived: '(() => { throw new Error("derive") })()' },
        }}
      />
    </StrictMode>,
  );
  expect(ref.current!.node?.diagnostics.status).toBe('degraded');
  expect(
    onError.mock.calls.filter(([record]) => record.level === 'error'),
  ).toHaveLength(1);
  expect(sink).toHaveBeenCalledOnce();
  await expect(ref.current!.submit()).rejects.toMatchObject({
    code: 'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED',
  });
});

it('ERROR-026 ERROR-117 delivers buffered load errors before a root render failure', () => {
  const sink = vi.fn();
  vi.stubGlobal('reportError', sink);
  const onError = vi.fn();
  const renderError = new Error('render');
  const Broken = () => {
    throw renderError;
  };
  render(
    <Form
      onError={onError}
      jsonSchema={{
        type: 'string',
        controls: { derived: '(() => { throw new Error("derive") })()' },
      }}
    >
      <Broken />
    </Form>,
  );
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    'SCHEMA_FORM_ERROR.EXPRESSION_THREW',
    'SCHEMA_FORM_ERROR.RENDER_FAILED',
  ]);
});
