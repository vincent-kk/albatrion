import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

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
  it('shows sorted thumbs while keeping the stored range order on mount', () => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'array',
          format: 'slider',
          items: { type: 'number' },
        }}
        defaultValue={[80, 20]}
        onError={() => {}}
      />,
    );
    expect(thumbBounds(view.container)).toEqual([
      ['0', '100', '20'],
      ['0', '100', '80'],
    ]);
    expect(ref.current?.getValue()).toEqual([80, 20]);
  });

  it('uses array bounds and step when the numeric items omit them', () => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'array',
          format: 'slider',
          items: { type: 'number' },
          minimum: 20,
          maximum: 30,
          multipleOf: 5,
        }}
        defaultValue={[20, 30]}
        onError={() => {}}
      />,
    );
    const track = view.container.querySelector('.adm-slider-track')!;
    fireEvent.click(track, { clientX: 0 });
    expect(ref.current?.getValue()).toEqual([20, 30]);
    fireEvent.click(track, { clientX: 40 });
    expect(ref.current?.getValue()).toEqual([25, 30]);
    expect(thumbBounds(view.container)).toEqual([
      ['20', '30', '25'],
      ['20', '30', '30'],
    ]);
  });

  it('a numeric array slider takes its bounds from items.minimum and items.maximum', () => {
    const view = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
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
        fieldInputDefinitions={plugin.fieldInputDefinitions}
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
        fieldInputDefinitions={plugin.fieldInputDefinitions}
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

  it('uses numeric item bounds when the array also has numeric properties', () => {
    const view = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'array',
          format: 'slider',
          items: { type: 'number', minimum: 0, maximum: 1000 },
          minimum: 40,
          maximum: 80,
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
