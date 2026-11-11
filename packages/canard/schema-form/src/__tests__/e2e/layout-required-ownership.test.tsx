import { useState } from 'react';

import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  FormProvider,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each case owns one form and changes only layout component state. */
let form: FormHarness;
afterEach(() => form?.unmount());

/** Observe required without enabling native constraint validation. */
const Input = ({ path, required }: FieldInputProps) => (
  <input id={path} data-required={required} />
);

/** Observe the renderer and input independently. */
const Renderer = ({ Input, required }: FieldRendererProps) => (
  <div data-renderer-required={required}>
    <Input />
  </div>
);

it.each(['Input', 'Render', 'Field'])(
  'Form.%s delivers parent-only required changes to both surfaces',
  async (surface) => {
    const Layout = () => {
      const [step, setStep] = useState(0);
      const required = [undefined, true, false, undefined][step];
      return (
        <FormProvider InputRenderer={Renderer}>
          <button type="button" onClick={() => setStep((step) => step + 1)}>
            next
          </button>
          {surface === 'Input' ? (
            <Form.Input path="/a" FieldInput={Input} required={required} />
          ) : surface === 'Render' ? (
            <Form.Render path="/a" FieldInput={Input} required={required}>
              {Renderer}
            </Form.Render>
          ) : (
            <Form.Field
              path="/a"
              FieldInput={Input}
              FieldRenderer={Renderer}
              required={required}
            />
          )}
        </FormProvider>
      );
    };
    form = await renderForm(
      {
        type: 'object',
        required: ['a'],
        properties: {
          a: { type: 'string', presentation: { required: false } },
        },
      },
      { children: <Layout /> },
    );
    const input = form.field('/a');
    expect(input!.getAttribute('data-required')).toBe('false');
    expect(
      form.container
        .querySelector('[data-renderer-required]')!
        .getAttribute('data-renderer-required'),
    ).toBe('false');
    for (const expected of ['true', 'false', 'false']) {
      await form.user.click(form.container.querySelector('button')!);
      expect(form.field('/a')!.getAttribute('data-required')).toBe(expected);
      expect(
        form.container
          .querySelector('[data-renderer-required]')!
          .getAttribute('data-renderer-required'),
      ).toBe(expected);
      expect(form.field('/a')).toBe(input);
    }
  },
);
