import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../../fieldInputs/FieldInputSlider';

beforeEach(() => {
  // A 100px track starting at x=0, so clientX is the percentage along it.
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 100,
    bottom: 10,
    width: 100,
    height: 10,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const thumbBounds = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[role="slider"]')).map((thumb) => [
    thumb.getAttribute('aria-valuemin'),
    thumb.getAttribute('aria-valuemax'),
    thumb.getAttribute('aria-valuenow'),
  ]);

describe('range slider bounds from items (antd-mobile)', () => {
  it('a numeric array slider takes its bounds from items.minimum and items.maximum', () => {
    const view = render(
      <Form
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'array',
          format: 'slider',
          items: { type: 'number', minimum: 0, maximum: 1000 },
        }}
        defaultValue={[200, 800]}
        onError={() => {}}
      />,
    );
    expect(thumbBounds(view.container)).toEqual([
      ['0', '1000', '200'],
      ['0', '1000', '800'],
    ]);
  });

  it('a click at the middle of the track writes the middle of the item range', () => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'array',
          format: 'slider',
          items: { type: 'number', minimum: 0, maximum: 1000 },
        }}
        defaultValue={[200, 800]}
        onError={() => {}}
      />,
    );
    const track = view.container.querySelector('.adm-slider-track')!;
    fireEvent.click(track, { clientX: 50 });
    expect(ref.current!.getValue()).toEqual([500, 800]);
  });

  it('control: a number slider takes its bounds from minimum and maximum', () => {
    const view = render(
      <Form
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'number',
          format: 'slider',
          minimum: 0,
          maximum: 1000,
        }}
        defaultValue={200}
        onError={() => {}}
      />,
    );
    expect(thumbBounds(view.container).at(-1)).toEqual(['0', '1000', '200']);
  });

  it('diagnostic: bounds written on the array schema itself', () => {
    const view = render(
      <Form
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'array',
          format: 'slider',
          items: { type: 'number' },
          minimum: 0,
          maximum: 1000,
        }}
        defaultValue={[200, 800]}
        onError={() => {}}
      />,
    );
    expect(thumbBounds(view.container)).toEqual([
      ['0', '1000', '200'],
      ['0', '1000', '800'],
    ]);
  });
});
