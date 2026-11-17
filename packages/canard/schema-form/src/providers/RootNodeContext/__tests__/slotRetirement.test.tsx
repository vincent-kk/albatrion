import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each(['rebuild', 'reset', 'unmount'] as const)(
  'DR-2 gate owns a late rejecting slot after %s',
  async (operation) => {
    const slots: (() => void)[] = [];
    vi.spyOn(core, 'scheduleValidationSlot').mockImplementation((callback) => {
      slots.push(callback);
    });
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    let reject: (error: Error) => void = () => {
      throw new Error('slot did not start');
    };
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        onError={onError}
        validatorFactory={{
          compile: () => () =>
            new Promise<[]>((_, fail) => {
              reject = fail;
            }),
          compileGuard: () => () => true,
        }}
      >
        <span />
      </Form>,
    );
    await act(async () => {
      slots.shift()!();
      await Promise.resolve();
    });
    act(() => {
      if (operation === 'unmount') view.unmount();
      else ref.current![operation]();
    });
    await act(async () => {
      reject(new Error('late slot'));
      await new Promise<void>((resolve) => setImmediate(resolve));
    });
    expect(onError).toHaveBeenCalledTimes(operation === 'rebuild' ? 0 : 1);
    expect(host).toHaveBeenCalledTimes(operation === 'rebuild' ? 0 : 1);
  },
);
