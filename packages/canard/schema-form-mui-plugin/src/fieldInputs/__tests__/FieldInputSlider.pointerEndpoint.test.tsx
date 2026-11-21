import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { sliderReference } from '../../__tests__/utils/sliderReference';
import { FieldInputSliderDefinition } from '../FieldInputSlider';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('matches the native pointer projection near a fractional inclusive endpoint', () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'number',
        format: 'slider',
        minimum: 0,
        maximum: 1.8,
        presentation: { inputType: 'slider' },
      }}
      defaultValue={0}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
    />,
  );
  const track = view.container.querySelector<HTMLElement>('.MuiSlider-root');
  if (!track) throw new Error('missing track');
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ width: 100, height: 10 }),
  );
  vi.spyOn(track, 'offsetWidth', 'get').mockReturnValue(100);
  fireEvent.mouseDown(track, { button: 0, buttons: 1, clientX: 80 });
  fireEvent.mouseUp(document, { button: 0, clientX: 80 });
  expect(ref.current?.getValue()).toBe(
    sliderReference({ type: 'number', minimum: 0, maximum: 1.8 }).pointer(
      1.44,
      false,
    ),
  );
});
