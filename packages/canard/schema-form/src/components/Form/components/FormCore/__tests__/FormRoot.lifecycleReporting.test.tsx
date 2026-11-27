import { useRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { FormErrorCode } from '@/schema-form/errors';
import {
  FieldLifecycle,
  FieldLifecycleAction,
} from '@/schema-form/helpers/fieldLifecycle';
import { useFieldLifecycleContext } from '@/schema-form/providers/FieldLifecycleContext';
import type { FieldInputProps } from '@/schema-form/types';

import { FormCore } from '../FormCore';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract root-boundary
it('reports an unstringifiable lifecycle error without losing its original value', () => {
  const error: object = Object.create(null);
  const reported = vi.fn();
  const continued = vi.fn(() => FieldLifecycleAction.Focus);
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const Input = ({ node }: FieldInputProps) => {
    const registry = useFieldLifecycleContext();
    const once = useRef(false);
    if (!once.current) {
      once.current = true;
      registry!.reserve(node, FieldLifecycle.Mount, () => {
        throw error;
      });
      registry!.reserve(node, FieldLifecycle.Mount, continued);
    }
    return <input aria-label="surviving input" />;
  };
  const view = render(
    <FormCore
      jsonSchema={{ type: 'string', presentation: { FieldInput: Input } }}
      onError={(record) => {
        if (record.code === FormErrorCode.ListenerThrew) reported(record);
      }}
    />,
  );
  expect(reported).toHaveBeenCalledTimes(1);
  expect(reported.mock.calls[0][0].error).toBe(error);
  expect(reported.mock.calls[0][0]).toMatchObject({
    code: FormErrorCode.ListenerThrew,
    origin: 'render',
    path: '',
  });
  expect(continued).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(view.getByLabelText('surviving input'));
  expect(host).not.toHaveBeenCalled();
});
