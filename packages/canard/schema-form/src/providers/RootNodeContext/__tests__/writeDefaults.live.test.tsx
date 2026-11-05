import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { SetValueOption, ValidationMode } from '@/schema-form/core';

afterEach(cleanup);

it('disableAutomaticWrites changes the next entry without retroactive writes and preserves call overrides', () => {
  const ref = createRef<FormHandle>();
  const schema = {
    type: 'object',
    properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source' } },
    },
  } as const;
  const form = (disableAutomaticWrites: boolean) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ source: 'initial', target: 'kept' }}
      disableAutomaticWrites={disableAutomaticWrites}
      validationMode={ValidationMode.None}
    >
      <span />
    </Form>
  );
  const view = render(form(true));
  const root = ref.current!.node;
  expect(ref.current!.getValue()).toEqual({
    source: 'initial',
    target: 'kept',
  });
  view.rerender(form(false));
  expect(ref.current!.getValue()).toEqual({
    source: 'initial',
    target: 'kept',
  });
  act(() => ref.current!.findNode('/source')!.setValue('next'));
  expect(ref.current!.getValue()).toEqual({ source: 'next', target: 'next' });
  view.rerender(form(true));
  act(() => ref.current!.findNode('/source')!.setValue('held'));
  expect(ref.current!.getValue()).toEqual({ source: 'held', target: 'next' });
  act(() =>
    ref
      .current!.findNode('/source')!
      .setValue('forced', SetValueOption.EnableAutomaticWrites),
  );
  expect(ref.current!.getValue()).toEqual({
    source: 'forced',
    target: 'forced',
  });
  expect(ref.current!.node).toBe(root);
});

it('unsetOnInactive keeps retained data until the next exit and respects node policy', () => {
  const ref = createRef<FormHandle>();
  const schema = {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../enabled === true' } },
      kept: {
        type: 'string',
        controls: { active: '../enabled === true', unsetOnInactive: false },
      },
    },
  } as const;
  const form = (unsetOnInactive: boolean) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ enabled: true, value: 'saved', kept: 'kept' }}
      unsetOnInactive={unsetOnInactive}
      validationMode={ValidationMode.None}
    >
      <span />
    </Form>
  );
  const view = render(form(false));
  const root = ref.current!.node;
  act(() => ref.current!.findNode('/enabled')!.setValue(false));
  const inactive = root!.inactiveValues;
  view.rerender(form(true));
  expect(root!.inactiveValues).toBe(inactive);
  act(() => ref.current!.findNode('/enabled')!.setValue(true));
  expect(ref.current!.findNode('/value')!.value).toBe('saved');
  act(() => ref.current!.findNode('/enabled')!.setValue(false));
  act(() => ref.current!.findNode('/enabled')!.setValue(true));
  expect(ref.current!.findNode('/value')!.value).toBeUndefined();
  expect(ref.current!.findNode('/kept')!.value).toBe('kept');
  expect(ref.current!.node).toBe(root);
});
