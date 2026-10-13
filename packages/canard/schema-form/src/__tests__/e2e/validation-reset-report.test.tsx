import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

import {
  type FormHarness,
  renderForm,
  setupValidatorPlugin,
} from '../renderForm';

/** String schema that rejects the value used before reset. */
const schema = { type: 'string', minLength: 3 } satisfies JSONSchema;

/** Different authored schema that forces reset to replace the root. */
const replacement = { type: 'string', minLength: 4 } satisfies JSONSchema;

/** Harness retained for cleanup after each consumer callback assertion. */
let form: FormHarness | undefined;
afterEach(() => {
  form?.unmount();
  form = undefined;
  cleanup();
});

describe('243C-01 reset validation report', () => {
  it('clears an OnRequest report once while retaining an unchanged root', async () => {
    const onValidate = vi.fn();
    form = await renderForm(schema, {
      validator: true,
      defaultValue: 'ab',
      validationMode: ValidationMode.OnRequest,
      onValidate,
    });
    const root = form.handle.node;
    expect(await form.validate()).not.toEqual([]);
    expect(onValidate.mock.lastCall?.[0]).not.toEqual([]);
    const before = onValidate.mock.calls.length;

    await form.reset();
    await form.flush();

    expect(form.handle.node).toBe(root);
    expect(onValidate.mock.calls.slice(before)).toEqual([[[]]]);
    expect(form.getErrors()).toEqual([]);
  });

  it('adds no OnRequest report when the last report is already empty', async () => {
    const onValidate = vi.fn();
    form = await renderForm(schema, {
      validator: true,
      defaultValue: 'valid',
      validationMode: ValidationMode.OnRequest,
      onValidate,
    });
    await form.validate();
    expect(onValidate).toHaveBeenLastCalledWith([]);
    const before = onValidate.mock.calls.length;

    await form.reset();
    await form.flush();

    expect(onValidate).toHaveBeenCalledTimes(before);
    expect(form.getErrors()).toEqual([]);
  });

  it('clears an OnChange report exactly once without duplicating the root event', async () => {
    const onValidate = vi.fn();
    form = await renderForm(schema, {
      validator: true,
      defaultValue: 'valid',
      validationMode: ValidationMode.OnChange,
      onValidate,
    });
    await form.setValue('ab');
    await form.flush();
    expect(onValidate.mock.lastCall?.[0]).not.toEqual([]);
    const before = onValidate.mock.calls.length;

    await form.reset();
    await form.flush();

    expect(onValidate.mock.calls.slice(before)).toEqual([[[]]]);
    expect(form.getErrors()).toEqual([]);
  });

  it.each([
    { label: 'OnRequest', validationMode: ValidationMode.OnRequest },
    { label: 'OnChange', validationMode: ValidationMode.OnChange },
  ])(
    'clears the last report once when $label reset rebuilds the root',
    async ({ validationMode }) => {
      setupValidatorPlugin();
      const ref = createRef<FormHandle>();
      const onValidate = vi.fn();
      const view = render(
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="ab"
          validationMode={validationMode}
          onValidate={onValidate}
        >
          <span />
        </Form>,
      );
      await act(async () => {
        await ref.current!.validate();
      });
      expect(onValidate.mock.lastCall?.[0]).not.toEqual([]);
      const root = ref.current!.node;
      const before = onValidate.mock.calls.length;
      view.rerender(
        <Form
          ref={ref}
          jsonSchema={replacement}
          defaultValue="valid"
          validationMode={validationMode}
          onValidate={onValidate}
        >
          <span />
        </Form>,
      );
      expect(ref.current!.node).toBe(root);

      await act(async () => {
        ref.current!.reset();
        expect(ref.current!.node).not.toBe(root);
        expect(ref.current!.getErrors()).toEqual([]);
        expect(onValidate.mock.lastCall?.[0]).toBe(ref.current!.getErrors());
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(onValidate.mock.calls.slice(before)).toEqual([[[]]]);
      expect(ref.current!.getErrors()).toEqual([]);
      await act(async () => {
        ref.current!.reset();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(onValidate.mock.calls.slice(before)).toEqual([[[]]]);
    },
  );

  it('adds no OnRequest report when a rebuild follows an empty report', async () => {
    setupValidatorPlugin();
    const ref = createRef<FormHandle>();
    const onValidate = vi.fn();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="valid"
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );
    await act(async () => {
      await ref.current!.validate();
    });
    expect(onValidate).toHaveBeenLastCalledWith([]);
    const root = ref.current!.node;
    const before = onValidate.mock.calls.length;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={replacement}
        defaultValue="valid"
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );

    await act(async () => {
      ref.current!.reset();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(ref.current!.node).not.toBe(root);
    expect(onValidate).toHaveBeenCalledTimes(before);
    expect(ref.current!.getErrors()).toEqual([]);
  });

  it('adds no OnRequest report when a rebuild precedes the first validation', async () => {
    setupValidatorPlugin();
    const ref = createRef<FormHandle>();
    const onValidate = vi.fn();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="ab"
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );
    const root = ref.current!.node;
    expect(onValidate).not.toHaveBeenCalled();
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={replacement}
        defaultValue="valid"
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );
    expect(ref.current!.node).toBe(root);

    await act(async () => {
      ref.current!.reset();
      expect(ref.current!.node).not.toBe(root);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onValidate).not.toHaveBeenCalled();
    expect(ref.current!.getErrors()).toEqual([]);
  });

  it('does not report an empty list when the replacement root retains external errors', async () => {
    setupValidatorPlugin();
    const ref = createRef<FormHandle>();
    const onValidate = vi.fn();
    const errors = [{ dataPath: '', message: 'server says no' }];
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="valid"
        errors={errors}
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );
    await act(async () => {
      await ref.current!.validate();
    });
    expect(onValidate.mock.lastCall?.[0]).not.toEqual([]);
    const root = ref.current!.node;
    const before = onValidate.mock.calls.length;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={replacement}
        defaultValue="valid"
        errors={errors}
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );

    await act(async () => {
      ref.current!.reset();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(ref.current!.node).not.toBe(root);
    expect(ref.current!.getErrors()).toEqual(errors);
    expect(onValidate.mock.calls.slice(before)).toEqual([]);
  });

  it('adds no report when validate() finds no errors after the errors prop was cleared', async () => {
    setupValidatorPlugin();
    const ref = createRef<FormHandle>();
    const onValidate = vi.fn();
    const errors = [{ dataPath: '', message: 'server says no' }];
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="valid"
        errors={errors}
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="valid"
        errors={[]}
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      >
        <span />
      </Form>,
    );
    expect(onValidate.mock.lastCall?.[0]).toEqual([]);
    const before = onValidate.mock.calls.length;

    await act(async () => {
      await ref.current!.validate();
    });

    expect(ref.current!.getErrors()).toEqual([]);
    expect(onValidate.mock.calls.slice(before)).toEqual([]);
  });

  it('surfaces a replacement mount error when the empty report consumer also throws', async () => {
    setupValidatorPlugin();
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    let fail = false;
    const onValidate = vi.fn<(errors: unknown) => void>(() => {
      if (fail) throw new Error('consumer onValidate failed');
    });
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="ab"
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
        onError={onError}
      >
        <span />
      </Form>,
    );
    await act(async () => {
      await ref.current!.validate();
    });
    expect(onValidate.mock.lastCall?.[0]).not.toEqual([]);
    const root = ref.current!.node;
    const before = onValidate.mock.calls.length;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'number',
          controls: {
            derived:
              '(() => { throw new Error("replacement mount failed") })()',
          },
        }}
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
        onError={onError}
      >
        <span />
      </Form>,
    );
    fail = true;

    let thrown: unknown;
    await act(async () => {
      try {
        ref.current!.reset();
      } catch (error) {
        thrown = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(ref.current!.node).not.toBe(root);
    expect(ref.current!.node!.diagnostics.status).toBe('degraded');
    expect(ref.current!.getErrors()).toEqual([]);
    expect(onValidate.mock.calls.slice(before)).toEqual([[[]]]);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'SCHEMA_FORM_ERROR.EXPRESSION_THREW',
        schemaPath: '#/controls/derived',
        surface: 'thrown',
      }),
    );
    expect(thrown).toBe(onError.mock.lastCall?.[0].error);
  });

  it('finishes a rebuild before the empty report reaches a throwing consumer', async () => {
    setupValidatorPlugin();
    const ref = createRef<FormHandle>();
    let fail = false;
    const onValidate = vi.fn<(errors: unknown) => void>(() => {
      if (fail) throw new Error('consumer onValidate failed');
    });
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="ab"
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      />,
    );
    await act(async () => {
      await ref.current!.validate();
    });
    expect(onValidate.mock.lastCall?.[0]).not.toEqual([]);
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={replacement}
        defaultValue="valid"
        validationMode={ValidationMode.OnRequest}
        onValidate={onValidate}
      />,
    );
    fail = true;

    let thrown: unknown;
    await act(async () => {
      try {
        ref.current!.reset();
      } catch (error) {
        thrown = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect((thrown as Error | undefined)?.message).toBe(
      'consumer onValidate failed',
    );
    expect(view.container.querySelector('input')!.value).toBe('valid');
  });
});
