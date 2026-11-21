/**
 * r5-ui-rules slider table. The same file runs in all four UI plugins; only the
 * constants below differ. Imports the plugin from source (`../../index`) and the
 * core by name (its built `dist`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRef } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

const PLUGIN = 'antd6';
const mobile = false;
const rootSelector = '.ant-slider';

const LOG: Record<string, unknown> = {};
afterAll(() => {
  const dir = join(tmpdir(), 'r5-ui-rules');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, PLUGIN + '-slider.json'), JSON.stringify(LOG, null, 1));
});

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

export const violations = (value: unknown, c: Constraints): string[] => {
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
  const ref = createRef<FormHandle>();
  const { type = 'number', ...rest } = constraints;
  const schema = {
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
  } as JSONSchema;
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
  const value = () => (ref.current!.getValue() as { level?: number }).level;
  return { ref, view, value };
};

export const pressKeys = (keys: string[], release = true) => {
  const thumb = screen.getAllByRole('slider')[0];
  for (const key of keys)
    fireEvent.keyDown(thumb, { key, keyCode: KEY_CODES[key], which: KEY_CODES[key] });
  if (release) {
    const last = keys[keys.length - 1];
    fireEvent.keyUp(thumb, { key: last, keyCode: KEY_CODES[last], which: KEY_CODES[last] });
  }
};

/** Press the track at x (track width 100), then release there. */
export const pointerAt = (x: number, container: HTMLElement) => {
  const thumb = screen.getAllByRole('slider')[0];
  if (mobile) {
    const track = container.querySelector('.adm-slider-track');
    if (!track) throw Error('Missing track');
    fireEvent.click(track, { clientX: x, clientY: 0 });
  } else {
    const root = thumb.closest(rootSelector);
    if (!root) throw Error('Missing slider root');
    fireEvent.mouseDown(root, { button: 0, buttons: 1, clientX: x, clientY: 0 });
    fireEvent.mouseUp(document, { button: 0, clientX: x, clientY: 0 });
  }
};

const grid5: Constraints = { minimum: 0, maximum: 100, multipleOf: 5 };

describe(`${PLUGIN} slider: a user step from a stored off-grid value stores a valid grid value`, () => {
  it.each([
    { name: 'stored 52, ArrowRight', stored: 52, keys: ['ArrowRight'] },
    { name: 'stored 52, ArrowLeft', stored: 52, keys: ['ArrowLeft'] },
    { name: 'stored 52, PageUp', stored: 52, keys: ['PageUp'] },
    { name: 'stored -3 (below minimum), ArrowRight', stored: -3, keys: ['ArrowRight'] },
    { name: 'stored 103 (above maximum), ArrowLeft', stored: 103, keys: ['ArrowLeft'] },
  ])('$name', ({ stored, keys }) => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(grid5, stored, lazy);
      pressKeys(keys);
      rows[`lazy=${lazy}`] = { value: value(), violations: violations(value(), grid5) };
      view.unmount();
    }
    LOG[expect.getState().currentTestName ?? '?'] = rows;
    expect(rows).toEqual({
      'lazy=undefined': { value: expect.any(Number), violations: [] },
      'lazy=false': { value: expect.any(Number), violations: [] },
    });
  });
});

describe(`${PLUGIN} slider: large keyboard steps from a stored valid grid value keep the grid`, () => {
  it.each([
    { name: 'multipleOf 3, stored 30, PageUp', constraints: { minimum: 0, maximum: 100, multipleOf: 3 }, stored: 30, key: 'PageUp', shift: false },
    { name: 'multipleOf 3, stored 30, PageDown', constraints: { minimum: 0, maximum: 100, multipleOf: 3 }, stored: 30, key: 'PageDown', shift: false },
    { name: 'multipleOf 3, stored 30, Shift+ArrowRight', constraints: { minimum: 0, maximum: 100, multipleOf: 3 }, stored: 30, key: 'ArrowRight', shift: true },
    { name: 'multipleOf 4, stored 40, PageDown', constraints: { minimum: 0, maximum: 100, multipleOf: 4 }, stored: 40, key: 'PageDown', shift: false },
    { name: 'multipleOf 0.3, stored 0.3, PageUp', constraints: { minimum: 0, maximum: 30, multipleOf: 0.3 }, stored: 0.3, key: 'PageUp', shift: false },
    { name: 'multipleOf 25, stored 25, PageUp', constraints: { minimum: 0, maximum: 1000, multipleOf: 25 }, stored: 25, key: 'PageUp', shift: false },
    { name: 'integer 0..100 without multipleOf, stored 50, PageUp', constraints: { type: 'integer' as const, minimum: 0, maximum: 100 }, stored: 50, key: 'PageUp', shift: false },
  ])('$name', ({ constraints, stored, key, shift }) => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(constraints, stored, lazy);
      const thumb = screen.getAllByRole('slider')[0];
      fireEvent.keyDown(thumb, { key, keyCode: KEY_CODES[key], which: KEY_CODES[key], shiftKey: shift });
      fireEvent.keyUp(thumb, { key, keyCode: KEY_CODES[key], which: KEY_CODES[key], shiftKey: shift });
      rows[`lazy=${lazy}`] = { value: value(), violations: violations(value(), constraints) };
      view.unmount();
    }
    LOG[expect.getState().currentTestName ?? '?'] = rows;
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
      constraints: { minimum: 0, exclusiveMinimum: 0, maximum: 1, multipleOf: 0.1 },
      keys: ['Home'],
    },
  ])('$name stores a value inside the exclusive bound', ({ constraints, keys }) => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(constraints, undefined, lazy);
      pressKeys(keys);
      rows[`lazy=${lazy}`] = { value: value(), violations: violations(value(), constraints) };
      view.unmount();
    }
    LOG[expect.getState().currentTestName ?? '?'] = rows;
    expect(rows).toEqual({
      'lazy=undefined': { value: expect.any(Number), violations: [] },
      'lazy=false': { value: expect.any(Number), violations: [] },
    });
  });
});

describe(`${PLUGIN} slider: pointer values are exact grid values`, () => {
  it.each([
    { name: 'multipleOf 0.1 at x=30', constraints: { minimum: 0, maximum: 1, multipleOf: 0.1 }, x: 30, expected: 0.3 },
    { name: 'multipleOf 0.1 at x=70', constraints: { minimum: 0, maximum: 1, multipleOf: 0.1 }, x: 70, expected: 0.7 },
    { name: 'multipleOf 0.05 from 0.1 at x=55', constraints: { minimum: 0.1, maximum: 1.1, multipleOf: 0.05 }, x: 55, expected: 0.65 },
    { name: 'multipleOf 1e-7 at x=50', constraints: { minimum: 1e-8, maximum: 9.9e-7, multipleOf: 1e-7 }, x: 50, expected: 5e-7 },
    { name: 'multipleOf 5e-7 at x=50', constraints: { minimum: 0, maximum: 1e-5, multipleOf: 5e-7 }, x: 50, expected: 5e-6 },
    { name: 'multipleOf 5e-7 at x=10', constraints: { minimum: 0, maximum: 1e-5, multipleOf: 5e-7 }, x: 10, expected: 1e-6 },
  ])('$name stores the pressed grid value', ({ constraints, x, expected }) => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(constraints, undefined, lazy);
      pointerAt(x, view.container);
      rows[`lazy=${lazy}`] = { value: value(), violations: violations(value(), constraints) };
      view.unmount();
    }
    LOG[expect.getState().currentTestName ?? '?'] = rows;
    expect(rows).toEqual({
      'lazy=undefined': { value: expected, violations: [] },
      'lazy=false': { value: expected, violations: [] },
    });
  });
});

describe(`${PLUGIN} slider: measurements shared across plugins (EQ11)`, () => {
  it('measurement: unset, each single key, lazy omitted and false', () => {
    const constraints = { minimum: 10, maximum: 20, multipleOf: 5 };
    const rows: Record<string, unknown> = {};
    for (const key of ['ArrowLeft', 'ArrowDown', 'PageDown', 'Home', 'ArrowRight', 'End'])
      for (const lazy of [undefined, false]) {
        const { value, view } = mount(constraints, undefined, lazy);
        pressKeys([key]);
        rows[`${key} lazy=${lazy}`] = value();
        view.unmount();
      }
    LOG['unset keys'] = rows;
    expect(Object.keys(rows)).toHaveLength(12);
  });

  it('measurement: three key repeats then one release, from stored 10', () => {
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(grid5, 10, lazy);
      const thumb = screen.getAllByRole('slider')[0];
      const seen: unknown[] = [];
      for (let i = 0; i < 3; i++) {
        fireEvent.keyDown(thumb, { key: 'ArrowRight', keyCode: 39, which: 39 });
        seen.push(value());
      }
      fireEvent.keyUp(thumb, { key: 'ArrowRight', keyCode: 39, which: 39 });
      seen.push(value());
      rows[`lazy=${lazy}`] = seen;
      view.unmount();
    }
    LOG['repeat'] = rows;
    LOG[expect.getState().currentTestName ?? '?'] = rows;
    expect(rows).toEqual({
      'lazy=undefined': [10, 10, 10, 25],
      'lazy=false': [15, 20, 25, 25],
    });
  });

  it('integer schema without multipleOf: stored 2.5, ArrowRight stores an integer', () => {
    const constraints: Constraints = { type: 'integer', minimum: 0, maximum: 10 };
    const rows: Record<string, unknown> = {};
    for (const lazy of [undefined, false]) {
      const { value, view } = mount(constraints, 2.5, lazy);
      pressKeys(['ArrowRight']);
      rows[`lazy=${lazy}`] = { value: value(), violations: violations(value(), constraints) };
      view.unmount();
    }
    LOG[expect.getState().currentTestName ?? '?'] = rows;
    expect(rows).toEqual({
      'lazy=undefined': { value: expect.any(Number), violations: [] },
      'lazy=false': { value: expect.any(Number), violations: [] },
    });
  });

  it('huge range: End from unset stores Number.MAX_SAFE_INTEGER', () => {
    const constraints: Constraints = { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER };
    const { value } = mount(constraints, undefined, false);
    pressKeys(['End']);
    expect(value()).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe(`${PLUGIN} slider: locks`, () => {
  it.each(['readOnly', 'disabled'] as const)('%s form: keyboard and pointer store nothing', (lock) => {
    for (const lazy of [undefined, false]) {
      for (const stored of [undefined, 15]) {
        const { value, view } = mount({ minimum: 10, maximum: 20, multipleOf: 5 }, stored, lazy, lock);
        pressKeys(['End']);
        pressKeys(['Home']);
        pointerAt(100, view.container);
        expect({ lazy, stored, value: value() }).toEqual({ lazy, stored, value: stored });
        view.unmount();
      }
    }
  });
});

describe(`${PLUGIN} slider: commit order against external writes (LC1)`, () => {
  it('lazy omitted: keydown, external setValue, keyup keeps the external value', async () => {
    const { ref, value } = mount(grid5, 50, undefined);
    const thumb = screen.getAllByRole('slider')[0];
    fireEvent.keyDown(thumb, { key: 'ArrowRight', keyCode: 39, which: 39 });
    await act(async () => {
      ref.current!.setValue({ level: 20 });
    });
    fireEvent.keyUp(thumb, { key: 'ArrowRight', keyCode: 39, which: 39 });
    const live = screen.getAllByRole('slider')[0];
    fireEvent.keyUp(live, { key: 'ArrowRight', keyCode: 39, which: 39 });
    expect(value()).toBe(20);
  });

  it('lazy omitted: keydown, reset, keyup keeps the reset value', async () => {
    const { ref, value } = mount(grid5, 50, undefined);
    const thumb = screen.getAllByRole('slider')[0];
    fireEvent.keyDown(thumb, { key: 'ArrowRight', keyCode: 39, which: 39 });
    await act(async () => {
      ref.current!.setValue({ level: 30 });
    });
    await act(async () => {
      ref.current!.reset();
    });
    const live = screen.getAllByRole('slider')[0];
    fireEvent.keyUp(live, { key: 'ArrowRight', keyCode: 39, which: 39 });
    expect(value()).toBe(50);
  });

  it('lazy omitted: pointer down, external setValue, pointer up keeps the external value', async () => {
    const { ref, value, view } = mount(grid5, 50, undefined);
    const thumb = screen.getAllByRole('slider')[0];
    if (mobile) {
      const touch = (x: number) => ({ identifier: 1, target: thumb, clientX: x, clientY: 0, pageX: x, pageY: 0 });
      fireEvent.touchStart(thumb, { touches: [touch(50)], changedTouches: [touch(50)], targetTouches: [touch(50)] });
      fireEvent.touchMove(thumb, { touches: [touch(90)], changedTouches: [touch(90)], targetTouches: [touch(90)] });
      await act(async () => {
        ref.current!.setValue({ level: 20 });
      });
      fireEvent.touchEnd(thumb, { touches: [], changedTouches: [touch(90)], targetTouches: [] });
    } else {
      const root = thumb.closest(rootSelector)!;
      fireEvent.mouseDown(root, { button: 0, buttons: 1, clientX: 50, clientY: 0 });
      fireEvent.mouseMove(document, { buttons: 1, clientX: 90, clientY: 0 });
      await act(async () => {
        ref.current!.setValue({ level: 20 });
      });
      fireEvent.mouseUp(document, { button: 0, clientX: 90, clientY: 0 });
    }
    void view;
    expect(value()).toBe(20);
  });
});
