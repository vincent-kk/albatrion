import { StrictMode, createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  type FieldRendererProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

// Regressions from the independent PR C live-configuration verification.
const schema = { type: 'string' } as const;
const Good = ({ Input, errorMessage }: FieldRendererProps) => (
  <div data-testid="good">
    <Input />
    {errorMessage}
  </div>
);
const Bad = () => {
  throw new Error('renderer failure');
};
const errors = [{ dataPath: '', message: 'issue' }];

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('reportError', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([false, true])(
  'recovers a replaced failed renderer (strict=%s)',
  (strict) => {
    const ref = createRef<FormHandle>();
    const element = (FieldRenderer: typeof Good | typeof Bad) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="kept"
          FieldRenderer={FieldRenderer}
          validationMode={ValidationMode.None}
          onError={() => {}}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element(Bad));
    const root = ref.current!.node;
    view.rerender(element(Good));
    expect(ref.current!.node).toBe(root);
    expect(ref.current!.getValue()).toBe('kept');
    expect(view.queryByTestId('good')).not.toBeNull();
  },
);

it.each([false, true])(
  'recovers a replaced throwing formatter (strict=%s)',
  (strict) => {
    const ref = createRef<FormHandle>();
    const element = (formatError: () => string) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="kept"
          FieldRenderer={Good}
          formatError={formatError}
          errors={errors}
          errorVisibility={ErrorVisibility.Always}
          validationMode={ValidationMode.None}
          onError={() => {}}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(
      element(() => {
        throw new Error('format error');
      }),
    );
    const root = ref.current!.node;
    view.rerender(element(() => 'fixed'));
    expect(ref.current!.node).toBe(root);
    expect(ref.current!.getValue()).toBe('kept');
    expect(view.getByTestId('good').textContent).toBe('fixed');
  },
);

it.each([false, true])(
  'reformats a healthy renderer without replacing input DOM (strict=%s)',
  (strict) => {
    const Input = () => <input aria-label="draft" defaultValue="kept" />;
    const map = { '#': Input };
    const element = (formatError: () => string) => {
      const form = (
        <Form
          jsonSchema={schema}
          FieldRenderer={Good}
          fieldInputMap={map}
          formatError={formatError}
          errors={errors}
          errorVisibility={ErrorVisibility.Always}
          validationMode={ValidationMode.None}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element(() => 'first'));
    const input = view.getByLabelText('draft');
    fireEvent.change(input, { target: { value: 'uncommitted' } });
    view.rerender(element(() => 'second'));
    expect(view.getByTestId('good').textContent).toBe('second');
    expect(view.getByLabelText('draft')).toBe(input);
    expect((input as HTMLInputElement).value).toBe('uncommitted');
  },
);
