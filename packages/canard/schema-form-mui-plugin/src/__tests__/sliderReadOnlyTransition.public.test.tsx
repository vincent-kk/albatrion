import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const sliderSchema: JSONSchema = {
  type: 'object',
  properties: {
    level: {
      type: 'number',
      format: 'slider',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    },
  },
};

const mount = (readOnly: boolean, initial: number) => {
  const ref = createRef<FormHandle>();
  const form = (lock: boolean) => (
    <Form
      ref={ref}
      readOnly={lock}
      defaultValue={{ level: initial }}
      jsonSchema={sliderSchema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />
  );
  const view = render(form(readOnly));
  return { ref, view, form };
};

it('shows the same valid decimal after switching to read-only as a read-only mount', () => {
  const { view, form, ref } = mount(false, 2.4);
  view.rerender(form(true));
  const transitioned = view.getByRole('slider').getAttribute('aria-valuenow');
  expect(ref.current!.getValue()).toEqual({ level: 2.4 });
  expect(transitioned).toBe('2.4');
  view.unmount();
  const direct = mount(true, 2.4);
  expect(direct.view.getByRole('slider').getAttribute('aria-valuenow')).toBe(
    transitioned,
  );
});
