import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle, registerPlugin } from '@canard/schema-form';

import { plugin } from '../../index';

registerPlugin(plugin);

beforeEach(() => {
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

// Copied from the README "Input Settings" section.
const jsonSchema = {
  type: 'object',
  properties: {
    volume: {
      type: 'number',
      format: 'slider',
      presentation: {
        FieldInputProps: { lazy: false, marks: { 0: '0', 100: '100' } },
      },
    },
  },
};

describe('README Input Settings example (antd-mobile)', () => {
  it('the documented volume slider stops at the clicked values, not only at its two marks', () => {
    const ref = createRef<FormHandle>();
    const view = render(<Form ref={ref} jsonSchema={jsonSchema} />);
    const marks = Array.from(
      view.container.querySelectorAll('.adm-slider-mark-text'),
    ).map((mark) => mark.textContent);
    expect(marks).toEqual(['0', '100']);
    const track = view.container.querySelector('.adm-slider-track')!;
    const written: unknown[] = [];
    fireEvent.click(track, { clientX: 70 });
    written.push(ref.current!.getValue());
    fireEvent.click(track, { clientX: 40 });
    written.push(ref.current!.getValue());
    expect(written).toEqual([{ volume: 70 }, { volume: 40 }]);
  });
});

describe('diagnostic: lazy false against the default on a track click (antd-mobile)', () => {
  it.each([
    ['lazy false', { lazy: false }],
    ['default lazy', {}],
  ])('%s publishes the clicked value', (_, props) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            volume: {
              type: 'number',
              format: 'slider',
              presentation: { FieldInputProps: props },
            },
          },
        }}
      />,
    );
    fireEvent.click(view.container.querySelector('.adm-slider-track')!, {
      clientX: 40,
    });
    const thumb = view.container.querySelector('[role="slider"]');
    expect([
      thumb?.getAttribute('aria-valuenow'),
      ref.current!.getValue(),
    ]).toEqual(['40', { volume: 40 }]);
  });
});
