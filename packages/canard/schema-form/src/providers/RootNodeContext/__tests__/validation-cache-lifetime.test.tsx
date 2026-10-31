import { StrictMode } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('IR-7 T5 unmount balances every validation root retain even under StrictMode replay', () => {
  const retained = vi.spyOn(core, 'retainValidationRoot');
  const released = vi.spyOn(core, 'releaseValidationRoot');
  const schema = { type: 'string' };
  const validator = { compile: () => () => [], compileGuard: () => () => true };
  const view = render(
    <StrictMode>
      <Form
        jsonSchema={schema}
        validatorFactory={validator}
        validationMode={core.ValidationMode.None}
      >
        <span />
      </Form>
    </StrictMode>,
  );
  expect(retained.mock.calls.length - released.mock.calls.length).toBe(1);
  view.unmount();
  expect(retained.mock.calls.length).toBeGreaterThan(0);
  expect(released.mock.calls).toEqual(retained.mock.calls);
});
