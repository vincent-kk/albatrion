import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  ValidationMode,
} from '../../index';
import { observeErrorSink } from '../helpers/observeErrorSink';

afterEach(cleanup);

/**
 * Render a form whose only field is gated by one context expression.
 * @param handle - Ref receiving the form handle
 * @param onError - Form error observer
 * @param active - Authored `controls.active` expression reading `@`
 * @param context - Value of the `context` prop
 * @returns The Form element
 */
const gatedForm = (
  handle: ReturnType<typeof createRef<FormHandle>>,
  onError: FormProps['onError'],
  active: string,
  context: Record<string, unknown>,
) => (
  <Form
    ref={handle}
    onError={onError}
    validationMode={ValidationMode.None}
    context={context}
    jsonSchema={{
      type: 'object',
      properties: { discount: { type: 'number', controls: { active } } },
    }}
    defaultValue={{ discount: 5 }}
  />
);

it('keeps the form mounted and degraded when a context change reaches a throw on plain dots', () => {
  const sink = observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const active = '@.user.plan.tier === "pro"';
  const view = render(
    gatedForm(handle, onError, active, { user: { plan: { tier: 'pro' } } }),
  );
  expect(handle.current?.findNode('/discount')).not.toBeNull();
  expect(onError).not.toHaveBeenCalled();
  view.rerender(gatedForm(handle, onError, active, { user: {} }));
  expect(handle.current).not.toBeNull();
  expect(handle.current?.node?.diagnostics.status).toBe('degraded');
  expect(onError).toHaveBeenCalledTimes(1);
  const [record] = onError.mock.calls[0];
  expect(record).toMatchObject({
    code: FormErrorCode.ExpressionThrew,
    origin: 'write',
  });
  expect(sink.errors().filter((error) => error === record.error)).toHaveLength(
    1,
  );
});

it.each([
  ['optional chaining after a bare @', '@.user?.plan?.tier === "pro"'],
  ['the parenthesized (@) form', '(@).user?.plan?.tier === "pro"'],
])('gates through a missing context object with %s', (_label, active) => {
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const view = render(gatedForm(handle, onError, active, {}));
  expect(handle.current!.findNode('/discount')).toBeNull();
  view.rerender(gatedForm(handle, onError, active, { user: {} }));
  expect(handle.current!.findNode('/discount')).toBeNull();
  view.rerender(
    gatedForm(handle, onError, active, { user: { plan: { tier: 'pro' } } }),
  );
  expect(handle.current!.findNode('/discount')).not.toBeNull();
  expect(onError).not.toHaveBeenCalled();
  expect(handle.current!.node!.diagnostics.status).toBe('stable');
});
