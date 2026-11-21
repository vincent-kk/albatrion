import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { sliderReference } from '../../__tests__/utils/sliderReference';
import { FieldInputSliderDefinition } from '../FieldInputSlider';

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
  vi.unstubAllGlobals();
});

it.each([undefined, true, false])(
  'discards the old key release after external replacement (lazy=%s)',
  (lazy) => {
    const schema = { type: 'number', minimum: 0, maximum: 10 } as const;
    const reference = sliderReference(schema);
    const key = { key: 'ArrowRight', keyCode: 39 };
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{
          ...schema,
          format: 'slider',
          presentation: {
            inputType: 'slider',
            FieldInputProps: { lazy },
          },
        }}
        defaultValue={2.4}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
      />,
    );
    const old = view.getByRole('slider');
    act(() => old.focus());
    fireEvent.keyDown(old, key);
    expect(view.getByRole('slider').getAttribute('aria-valuenow')).toBe(
      String(reference.expected(2.4, key.key)),
    );
    act(() => ref.current?.setValue(7.4));
    const replacement = view.getByRole('slider');
    act(() => replacement.focus());
    expect(document.activeElement).toBe(replacement);
    expect(ref.current?.getValue()).toBe(7.4);
    expect(replacement.getAttribute('aria-valuenow')).toBe(
      String(reference.displayed(7.4, false)),
    );
    fireEvent.keyUp(replacement, key);
    expect(ref.current?.getValue()).toBe(7.4);
    fireEvent.keyDown(replacement, key);
    fireEvent.keyUp(replacement, key);
    expect(ref.current?.getValue()).toBe(reference.expected(7.4, key.key));
  },
);
