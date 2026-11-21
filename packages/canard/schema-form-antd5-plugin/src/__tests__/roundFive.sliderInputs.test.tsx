import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

const PLUGIN = 'antd5';
const mobile = false;
const rootSelector = '.ant-slider';

const KEY_CODES: Record<string, number> = {
  Home: 36,
  End: 35,
  ArrowRight: 39,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowDown: 40,
  PageUp: 33,
  PageDown: 34,
};

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
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
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

type Constraints = {
  type?: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
};

/** Exact decimal multiple check: the value equals k * multipleOf written with 15 significant digits. */
const isOnGrid = (value: number, multipleOf: number) => {
  const k = Math.round(value / multipleOf);
  return Number((k * multipleOf).toPrecision(15)) === value;
};

const violations = (value: unknown, c: Constraints): string[] => {
  if (value === undefined) return [];
  if (typeof value !== 'number' || Number.isNaN(value)) return ['type'];
  const out: string[] = [];
  if ((c.type ?? 'number') === 'integer' && !Number.isInteger(value))
    out.push('integer');
  if (c.minimum !== undefined && value < c.minimum) out.push('minimum');
  if (c.maximum !== undefined && value > c.maximum) out.push('maximum');
  if (c.exclusiveMinimum !== undefined && value <= c.exclusiveMinimum)
    out.push('exclusiveMinimum');
  if (c.exclusiveMaximum !== undefined && value >= c.exclusiveMaximum)
    out.push('exclusiveMaximum');
  if (c.multipleOf !== undefined && !isOnGrid(value, c.multipleOf))
    out.push('multipleOf');
  return out;
};

const mount = (
  constraints: Constraints,
  stored: number | undefined,
  lazy: boolean | undefined,
  lock?: 'readOnly' | 'disabled',
) => {
  const ref = createRef<FormHandle<JSONSchema, { level?: number }>>();
  const { type = 'number', ...rest } = constraints;
  const schema: JSONSchema = {
    type: 'object',
    properties: {
      level: {
        type,
        format: 'slider',
        ...rest,
        presentation: {
          inputType: 'slider',
          FieldInputProps: lazy === undefined ? {} : { lazy },
        },
      },
    },
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={stored === undefined ? {} : { level: stored }}
      readOnly={lock === 'readOnly'}
      disabled={lock === 'disabled'}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  const value = () => ref.current!.getValue().level;
  return { ref, view, value };
};

const pressKeys = (keys: string[], release = true) => {
  const thumb = screen.getAllByRole('slider')[0];
  for (const key of keys)
    fireEvent.keyDown(thumb, {
      key,
      keyCode: KEY_CODES[key],
      which: KEY_CODES[key],
    });
  if (release) {
    const last = keys[keys.length - 1];
    fireEvent.keyUp(thumb, {
      key: last,
      keyCode: KEY_CODES[last],
      which: KEY_CODES[last],
    });
  }
};

/** Press the track at x (track width 100), then release there. */
const pointerAt = (x: number, container: HTMLElement) => {
  const thumb = screen.getAllByRole('slider')[0];
  if (mobile) {
    const track = container.querySelector('.adm-slider-track');
    if (!track) throw Error('Missing track');
    fireEvent.click(track, { clientX: x, clientY: 0 });
  } else {
    const root = thumb.closest(rootSelector);
    if (!root) throw Error('Missing slider root');
    fireEvent.mouseDown(root, {
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: 0,
    });
    fireEvent.mouseUp(document, { button: 0, clientX: x, clientY: 0 });
  }
};

const grid5: Constraints = { minimum: 0, maximum: 100, multipleOf: 5 };

describe(`${PLUGIN} slider: a user step from a stored off-grid value stores a valid grid value`, () => {
  it.each([
    { name: 'stored 52, ArrowRight', stored: 52, keys: ['ArrowRight'] },
    { name: 'stored 52, ArrowLeft', stored: 52, keys: ['ArrowLeft'] },
    { name: 'stored 52, PageUp', stored: 52, keys: ['PageUp'] },
    {
      name: 'stored -3 (below minimum), ArrowRight',
      stored: -3,
      keys: ['ArrowRight'],
    },
    {
      name: 'stored 103 (above maximum), ArrowLeft',
      stored: 103,
      keys: ['ArrowLeft'],
    },
  ])('$name', ({ stored, keys }) => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(grid5, stored, lazy);
      pressKeys(keys);
      rows[`lazy=${lazy}`] = {
        value: value(),
        violations: violations(value(), grid5),
      };
      view.unmount();
    }
    expect(rows['lazy=undefined']).toEqual(rows['lazy=false']);
    expect(rows).toEqual({
      'lazy=undefined': { value: expect.any(Number), violations: [] },
      'lazy=false': { value: expect.any(Number), violations: [] },
    });
  });
});

describe(`${PLUGIN} slider: large keyboard steps from a stored valid grid value keep the grid`, () => {
  it.each([
    {
      name: 'multipleOf 3, stored 30, PageUp',
      constraints: { minimum: 0, maximum: 100, multipleOf: 3 },
      stored: 30,
      key: 'PageUp',
      shift: false,
    },
    {
      name: 'multipleOf 3, stored 30, PageDown',
      constraints: { minimum: 0, maximum: 100, multipleOf: 3 },
      stored: 30,
      key: 'PageDown',
      shift: false,
    },
    {
      name: 'multipleOf 3, stored 30, Shift+ArrowRight',
      constraints: { minimum: 0, maximum: 100, multipleOf: 3 },
      stored: 30,
      key: 'ArrowRight',
      shift: true,
    },
    {
      name: 'multipleOf 4, stored 40, PageDown',
      constraints: { minimum: 0, maximum: 100, multipleOf: 4 },
      stored: 40,
      key: 'PageDown',
      shift: false,
    },
    {
      name: 'multipleOf 0.3, stored 0.3, PageUp',
      constraints: { minimum: 0, maximum: 30, multipleOf: 0.3 },
      stored: 0.3,
      key: 'PageUp',
      shift: false,
    },
    {
      name: 'multipleOf 25, stored 25, PageUp',
      constraints: { minimum: 0, maximum: 1000, multipleOf: 25 },
      stored: 25,
      key: 'PageUp',
      shift: false,
    },
    {
      name: 'integer 0..100 without multipleOf, stored 50, PageUp',
      constraints: { type: 'integer' as const, minimum: 0, maximum: 100 },
      stored: 50,
      key: 'PageUp',
      shift: false,
    },
  ])('$name', ({ constraints, stored, key, shift }) => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(constraints, stored, lazy);
      const thumb = screen.getAllByRole('slider')[0];
      fireEvent.keyDown(thumb, {
        key,
        keyCode: KEY_CODES[key],
        which: KEY_CODES[key],
        shiftKey: shift,
      });
      fireEvent.keyUp(thumb, {
        key,
        keyCode: KEY_CODES[key],
        which: KEY_CODES[key],
        shiftKey: shift,
      });
      rows[`lazy=${lazy}`] = {
        value: value(),
        violations: violations(value(), constraints),
      };
      view.unmount();
    }
    expect(rows['lazy=undefined']).toEqual(rows['lazy=false']);
    expect(rows).toEqual({
      'lazy=undefined': { value: expect.any(Number), violations: [] },
      'lazy=false': { value: expect.any(Number), violations: [] },
    });
  });
});

describe(`${PLUGIN} slider: exclusive bounds`, () => {
  it.each([
    {
      name: 'exclusiveMinimum 0, Home from unset',
      constraints: { exclusiveMinimum: 0, maximum: 10, multipleOf: 1 },
      keys: ['Home'],
    },
    {
      name: 'exclusiveMaximum 10, End from unset',
      constraints: { minimum: 0, exclusiveMaximum: 10, multipleOf: 1 },
      keys: ['End'],
    },
    {
      name: 'exclusiveMinimum 0 with minimum 0, Home from unset',
      constraints: {
        minimum: 0,
        exclusiveMinimum: 0,
        maximum: 1,
        multipleOf: 0.1,
      },
      keys: ['Home'],
    },
  ])(
    '$name stores a value inside the exclusive bound',
    ({ constraints, keys }) => {
      const rows: Record<string, unknown> = {};
      for (const lazy of [undefined, false]) {
        const { value, view } = mount(constraints, undefined, lazy);
        pressKeys(keys);
        rows[`lazy=${lazy}`] = {
          value: value(),
          violations: violations(value(), constraints),
        };
        view.unmount();
      }
      expect(rows['lazy=undefined']).toEqual(rows['lazy=false']);
      expect(rows).toEqual({
        'lazy=undefined': { value: expect.any(Number), violations: [] },
        'lazy=false': { value: expect.any(Number), violations: [] },
      });
    },
  );
});

describe(`${PLUGIN} slider: pointer values are exact grid values`, () => {
  it.each([
    {
      name: 'multipleOf 0.1 at x=30',
      constraints: { minimum: 0, maximum: 1, multipleOf: 0.1 },
      x: 30,
      expected: 0.3,
    },
    {
      name: 'multipleOf 0.1 at x=70',
      constraints: { minimum: 0, maximum: 1, multipleOf: 0.1 },
      x: 70,
      expected: 0.7,
    },
    {
      name: 'multipleOf 0.05 from 0.1 at x=55',
      constraints: { minimum: 0.1, maximum: 1.1, multipleOf: 0.05 },
      x: 55,
      expected: 0.65,
    },
    {
      name: 'multipleOf 1e-7 at x=50',
      constraints: { minimum: 1e-8, maximum: 9.9e-7, multipleOf: 1e-7 },
      x: 50,
      expected: 5e-7,
    },
    {
      name: 'multipleOf 5e-7 at x=50',
      constraints: { minimum: 0, maximum: 1e-5, multipleOf: 5e-7 },
      x: 50,
      expected: 5e-6,
    },
    {
      name: 'multipleOf 5e-7 at x=10',
      constraints: { minimum: 0, maximum: 1e-5, multipleOf: 5e-7 },
      x: 10,
      expected: 1e-6,
    },
  ])('$name stores the pressed grid value', ({ constraints, x, expected }) => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(constraints, undefined, lazy);
      pointerAt(x, view.container);
      rows[`lazy=${lazy}`] = {
        value: value(),
        violations: violations(value(), constraints),
      };
      view.unmount();
    }
    expect(rows['lazy=undefined']).toEqual(rows['lazy=false']);
    expect(rows).toEqual({
      'lazy=undefined': { value: expected, violations: [] },
      'lazy=false': { value: expected, violations: [] },
    });
  });
});
