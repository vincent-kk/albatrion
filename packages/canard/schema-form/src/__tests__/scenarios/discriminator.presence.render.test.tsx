import { createRef } from 'react';

import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  FormWarningCode,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

import { renderForm } from '../renderForm';

/** One declared object union used to compare discriminator presence across resets. */
const discriminated: JSONSchema = {
  type: 'object',
  properties: { kind: { type: 'string', enum: ['a', 'b'] } },
  controls: { discriminator: 'kind' },
  oneOf: [
    {
      properties: {
        kind: { const: 'a' },
        first: { type: 'string', default: 'first' },
      },
    },
    {
      properties: {
        kind: { const: 'b' },
        second: { type: 'string', default: 'second' },
      },
    },
  ],
};

describe('discriminator presence through the Form lifecycle', () => {
  it('P1 reads a removed and restored discriminator only when reset adopts the changed schema', async () => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const onSubmit = vi.fn();
    const plain: JSONSchema = { ...discriminated, controls: undefined };
    const view = render(
      <Form
        ref={ref}
        jsonSchema={discriminated}
        defaultValue={{ kind: 'a' }}
        validationMode={ValidationMode.None}
        onError={onError}
        onSubmit={onSubmit}
      />,
    );
    const handle = ref.current;
    if (!handle) throw new Error('Expected a mounted Form handle');
    expect(view.container.querySelector('[data-path="/first"]')).not.toBeNull();
    expect(view.container.querySelector('[data-path="/second"]')).toBeNull();
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={plain}
        defaultValue={{ kind: 'a' }}
        validationMode={ValidationMode.None}
        onError={onError}
        onSubmit={onSubmit}
      />,
    );
    expect(view.container.querySelector('[data-path="/second"]')).toBeNull();
    await act(async () => {
      handle.reset();
    });
    expect(handle.getValue()).toEqual({
      kind: 'a',
      first: 'first',
      second: 'second',
    });
    expect(
      view.container.querySelector('[data-path="/second"]'),
    ).not.toBeNull();
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={discriminated}
        defaultValue={{ kind: 'b' }}
        validationMode={ValidationMode.None}
        onError={onError}
        onSubmit={onSubmit}
      />,
    );
    await act(async () => {
      handle.reset();
    });
    expect(handle.getValue()).toEqual({ kind: 'b', second: 'second' });
    expect(view.container.querySelector('[data-path="/first"]')).toBeNull();
    await act(async () => {
      await handle.submit();
    });
    expect(onSubmit).toHaveBeenLastCalledWith({ kind: 'b', second: 'second' });
    expect(
      onError.mock.calls.filter(([record]) => record.level === 'error'),
    ).toEqual([]);
    view.unmount();
  });

  it('P2 restores the current tag selection after the containing parent re-enters', async () => {
    const onSubmit = vi.fn();
    const form = await renderForm(
      {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          group: {
            ...discriminated,
            controls: { discriminator: 'kind', active: '../enabled' },
          },
        },
      },
      {
        defaultValue: { enabled: true, group: { kind: 'a' } },
        validationMode: ValidationMode.None,
        onSubmit,
      },
    );
    await form.selectOption('/group/kind', 'b');
    expect(form.exists('/group/second')).toBe(true);
    await form.toggle('/enabled');
    expect(form.exists('/group/kind')).toBe(false);
    expect(form.exists('/group/second')).toBe(false);
    expect(form.getValue()).toEqual({ enabled: false });
    await form.toggle('/enabled');
    expect(form.exists('/group/first')).toBe(false);
    expect(form.exists('/group/second')).toBe(true);
    expect(form.getValue()).toEqual({
      enabled: true,
      group: { kind: 'b', second: 'second' },
    });
    await act(async () => {
      await form.handle.submit();
    });
    expect(onSubmit).toHaveBeenLastCalledWith(form.getValue());
    expect(
      form.errorRecords().filter(({ level }) => level === 'error'),
    ).toEqual([]);
    form.unmount();
  });

  it('P3 C2 mounts like an ordinary object and begins selecting after reset adds a union', async () => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const initial: JSONSchema = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      controls: { discriminator: 'kind' },
    };
    const plain = await renderForm(
      { ...initial, controls: undefined },
      { defaultValue: { kind: 'a' }, validationMode: ValidationMode.None },
    );
    const expected = plain.getValue();
    const expectedPaths = plain.renderedPaths();
    plain.unmount();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={initial}
        defaultValue={{ kind: 'a' }}
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );
    expect(ref.current?.getValue()).toEqual(expected);
    expect(
      Array.from(view.container.querySelectorAll('[data-path]'), (element) =>
        element.getAttribute('data-path'),
      ).filter((path) => path !== ''),
    ).toEqual(expectedPaths.filter((path) => path !== ''));
    expect(onError.mock.calls.map(([record]) => record)).toEqual([
      expect.objectContaining({
        code: FormWarningCode.DiscriminatorIgnoredForForm,
        level: 'warning',
        schemaPath: '#/controls/discriminator',
        details: { propertyName: 'kind', reason: 'union' },
      }),
    ]);
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={discriminated}
        defaultValue={{ kind: 'a' }}
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );
    await act(async () => {
      ref.current?.reset();
    });
    expect(ref.current?.getValue()).toEqual({ kind: 'a', first: 'first' });
    expect(view.container.querySelector('[data-path="/first"]')).not.toBeNull();
    expect(view.container.querySelector('[data-path="/second"]')).toBeNull();
    expect(
      onError.mock.calls.filter(
        ([record]) =>
          record.code === FormWarningCode.DiscriminatorIgnoredForForm,
      ),
    ).toHaveLength(1);
    view.unmount();
  });

  it('P3 C3 accepts a JavaScript-authored non-object host and reports its one ignored key', async () => {
    const runtime: JSONSchema = JSON.parse(
      '{"type":"string","controls":{"discriminator":"kind"}}',
    );
    const plain = await renderForm(
      { type: 'string' },
      { defaultValue: 'initial', validationMode: ValidationMode.None },
    );
    const expected = plain.getValue();
    const expectedPaths = plain.renderedPaths();
    plain.unmount();
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={runtime}
        defaultValue="initial"
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );
    expect(ref.current?.getValue()).toBe(expected);
    expect(
      Array.from(view.container.querySelectorAll('[data-path]'), (element) =>
        element.getAttribute('data-path'),
      ),
    ).toEqual(expectedPaths);
    expect(onError.mock.calls.map(([record]) => record)).toEqual([
      expect.objectContaining({
        code: FormWarningCode.DiscriminatorIgnoredForForm,
        level: 'warning',
        schemaPath: '#/controls/discriminator',
        details: { propertyName: 'kind', reason: 'host' },
      }),
    ]);
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={discriminated}
        defaultValue={{ kind: 'b' }}
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );
    await act(async () => {
      ref.current?.reset();
    });
    expect(ref.current?.getValue()).toEqual({ kind: 'b', second: 'second' });
    expect(view.container.querySelector('[data-path="/first"]')).toBeNull();
    expect(
      view.container.querySelector('[data-path="/second"]'),
    ).not.toBeNull();
    expect(
      onError.mock.calls.filter(
        ([record]) =>
          record.code === FormWarningCode.DiscriminatorIgnoredForForm,
      ),
    ).toHaveLength(1);
    view.unmount();
  });
});
