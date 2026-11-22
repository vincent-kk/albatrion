import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from 'antd-mobile';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

const bounds = { minimum: 0, maximum: 100, multipleOf: 5 };
const item = { type: 'number', ...bounds } satisfies JSONSchema;

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
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const cases = [
  {
    name: 'single slider',
    field: { ...item, format: 'slider' },
    range: false,
    initial: 10,
    changed: 30,
  },
  {
    name: 'range slider',
    field: { type: 'array', format: 'slider', items: item },
    range: true,
    initial: [10, 80],
    changed: [30, 80],
  },
] satisfies Array<{
  name: string;
  field: JSONSchema;
  range: boolean;
  initial: number | [number, number];
  changed: number | [number, number];
}>;

it.each(cases)(
  '$name matches the native keyboard boundary and stores one pointer change',
  async ({ field, range, initial, changed }) => {
    const keys = userEvent.setup();
    const nativeChange = vi.fn();
    const nativeCommit = vi.fn();
    const tabPastThumbs = async () => {
      await keys.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Before' }),
      );
      await keys.tab();
      const after = screen.getByRole('button', { name: 'After' });
      expect(document.activeElement).toBe(after);
      return after;
    };
    const pressKeys = () => keys.keyboard('{ArrowRight}{Home}{End} {Enter}');
    const thumbValues = () =>
      screen
        .getAllByRole('slider')
        .map((thumb) => thumb.getAttribute('aria-valuenow'));
    const initialThumbValues = (
      Array.isArray(initial) ? initial : [initial]
    ).map(String);
    const tapTrack = (container: HTMLElement, clientX: number) => {
      const track = container.querySelector('.adm-slider-track');
      expect(track).toBeTruthy();
      fireEvent.click(track!, { clientX });
    };

    const plain = render(
      <>
        <button>Before</button>
        <Slider
          min={bounds.minimum}
          max={bounds.maximum}
          step={bounds.multipleOf}
          range={range}
          defaultValue={initial}
          onChange={nativeChange}
          onAfterChange={nativeCommit}
        />
        <button>After</button>
      </>,
    );
    nativeChange.mockClear();
    nativeCommit.mockClear();
    const nativeAfter = await tabPastThumbs();
    const nativeThumbs = screen.getAllByRole('slider');
    expect(nativeThumbs).toHaveLength(range ? 2 : 1);
    nativeThumbs.forEach((thumb) => thumb.focus());
    expect(document.activeElement).toBe(nativeAfter);
    await pressKeys();
    expect(thumbValues()).toEqual(initialThumbValues);
    expect(nativeChange).not.toHaveBeenCalled();
    expect(nativeCommit).not.toHaveBeenCalled();
    tapTrack(plain.container, 30);
    expect(nativeCommit).toHaveBeenCalledTimes(1);
    expect(nativeCommit).toHaveBeenCalledWith(changed);
    plain.unmount();

    const schema = {
      type: 'object',
      properties: { level: field },
    } satisfies JSONSchema;
    const onChange = vi.fn();
    const ref = createRef<FormHandle>();
    const form = (lock?: 'readOnly' | 'disabled') => (
      <>
        <button>Before</button>
        <Form
          ref={ref}
          defaultValue={{ level: initial }}
          fieldInputDefinitions={[FieldInputSliderDefinition]}
          jsonSchema={schema}
          onChange={onChange}
          readOnly={lock === 'readOnly'}
          disabled={lock === 'disabled'}
          validationMode={0}
        />
        <button>After</button>
      </>
    );
    const view = render(form());
    const after = await tabPastThumbs();
    expect(screen.getAllByRole('slider')).toHaveLength(range ? 2 : 1);
    await act(async () => ref.current!.focus('/level'));
    expect(document.activeElement).toBe(after);
    await pressKeys();
    expect(thumbValues()).toEqual(initialThumbValues);
    expect(onChange).not.toHaveBeenCalled();
    expect(ref.current!.getValue()).toEqual({ level: initial });

    tapTrack(view.container, 30);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ level: changed });
    expect(ref.current!.getValue()).toEqual({ level: changed });

    for (const lock of ['readOnly', 'disabled'] as const) {
      view.rerender(form(lock));
      onChange.mockClear();
      tapTrack(view.container, 60);
      expect(onChange).not.toHaveBeenCalled();
      expect(ref.current!.getValue()).toEqual({ level: changed });
    }
  },
);
