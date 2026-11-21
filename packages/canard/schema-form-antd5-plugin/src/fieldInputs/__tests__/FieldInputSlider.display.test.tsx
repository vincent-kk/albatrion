import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { selectSliderCaseIndices } from '../../__tests__/utils/selectSliderCaseIndices';
import { sliderReference } from '../../__tests__/utils/sliderReference';
import { FieldInputSliderDefinition } from '../FieldInputSlider';

/** Every directed lock transition appears exactly once in this circuit. */
const modes = [0, 1, 2, 0, 2, 1, 0] as const;
/** A key that has no stored effect during either locked mode. */
const movement = { key: 'ArrowRight', keyCode: 39 };

afterEach(cleanup);

it('models slider display and retained values through all mounted lock transitions', () => {
  const types = ['number', 'integer'] as const;
  const steps = [undefined, 1, 3, 0.3, 0.1, 0.05, 1e-7];
  const markKinds = [0];
  const boundaries = ['absent', 'inclusive', 'exclusive', 'both'];
  const lazyModes = [undefined, true, false];
  const directions = ['ltr', 'rtl'] as const;
  const profile = selectSliderCaseIndices(
    [
      types.length,
      steps.length,
      boundaries.length,
      boundaries.length,
      3,
      lazyModes.length * directions.length * markKinds.length,
    ],
    process.env.SCHEMA_FORM_TEST_PROFILE !== 'pr',
  );
  const expected = new Set<string>();
  const observed = new Set<string>();
  const view = render(<div />);
  let index = 0;
  for (const type of types)
    for (const multipleOf of steps)
      for (const lower of boundaries)
        for (const upper of boundaries) {
          const unit = type === 'integer' ? 1 : (multipleOf ?? 1);
          const decimal = (value: number) => Number(value.toPrecision(12));
          const schema: NumberSchema = {
            type,
            ...(lower === 'inclusive' || lower === 'both'
              ? { minimum: decimal(0.1 * unit) }
              : {}),
            ...(lower === 'exclusive' || lower === 'both'
              ? { exclusiveMinimum: decimal(0.2 * unit) }
              : {}),
            ...(upper === 'inclusive' || upper === 'both'
              ? { maximum: decimal(4.1 * unit) }
              : {}),
            ...(upper === 'exclusive' || upper === 'both'
              ? { exclusiveMaximum: decimal(3.9 * unit) }
              : {}),
            multipleOf,
          };
          const grid = sliderReference({ ...schema, type });
          for (const [startKind, start] of [
            undefined,
            grid.min,
            decimal(grid.min + grid.step / 3),
          ].entries())
            for (const lazy of lazyModes)
              for (const direction of directions)
                for (const markKind of markKinds) {
                  const coverage = [
                    [type, multipleOf, lower, upper],
                    [startKind, lazy, direction, markKind],
                  ];
                  const schemaClass = JSON.stringify(coverage[0]);
                  const displayClass = JSON.stringify(coverage[1]);
                  expected.add(schemaClass);
                  expected.add(displayClass);
                  const frame = index++;
                  if (profile && !profile.has(frame)) continue;
                  observed.add(schemaClass);
                  observed.add(displayClass);
                  const marks = undefined;
                  const reference = sliderReference({ ...schema, type, marks });
                  const ref = createRef<FormHandle>();
                  const jsonSchema: NumberSchema = {
                    ...schema,
                    format: 'slider',
                    presentation: {
                      inputType: 'slider',
                      FieldInputProps: { lazy },
                    },
                  };
                  const form = (mode: (typeof modes)[number]) => (
                    <Form
                      key={frame}
                      ref={ref}
                      disabled={mode === 1}
                      readOnly={mode === 2}
                      jsonSchema={jsonSchema}
                      defaultValue={start}
                      fieldInputDefinitions={[FieldInputSliderDefinition]}
                    />
                  );

                  let thumb: HTMLElement | undefined;
                  for (const mode of modes) {
                    view.rerender(
                      <ConfigProvider direction={direction}>
                        {form(mode)}
                      </ConfigProvider>,
                    );
                    const currentThumb = view.getByRole('slider');
                    if (thumb) expect(currentThumb).toBe(thumb);
                    thumb = currentThumb;
                    const display = reference.displayed(start, mode === 2);
                    const context = JSON.stringify({
                      schema,
                      start,
                      mode,
                      lazy,
                      direction,
                      markKind,
                    });
                    expect(thumb.getAttribute('aria-valuenow'), context).toBe(
                      display === undefined ? null : String(display),
                    );
                    expect(thumb.getAttribute('aria-valuetext'), context).toBe(
                      display === undefined ? 'Not set' : null,
                    );
                    if (mode !== 0) {
                      fireEvent.keyDown(thumb, movement);
                      fireEvent.keyUp(thumb, movement);
                    }
                    expect(ref.current?.getValue(), context).toBe(start);
                  }
                }
        }
  expect(observed).toEqual(expected);
  expect(observed.size).toBe(242);
  expect(
    new Set(modes.slice(1).map((mode, index) => `${modes[index]}:${mode}`)),
  ).toEqual(new Set(['0:1', '0:2', '1:0', '1:2', '2:0', '2:1']));
}, 900000);

it.each([
  { stored: 0.4, maximum: 2, multipleOf: 1 },
  { stored: 0.5, maximum: 2, multipleOf: 1 },
  { stored: 1.4, maximum: 1.8, multipleOf: undefined },
])(
  'uses the nearest grid stop for stored $stored',
  ({ stored, maximum, multipleOf }) => {
    const schema = {
      type: 'number',
      format: 'slider',
      minimum: 0,
      maximum,
      multipleOf,
      presentation: { inputType: 'slider' },
    } satisfies NumberSchema;
    const expected = sliderReference(schema).displayed(stored, false);
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={stored}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
      />,
    );
    expect(view.getByRole('slider').getAttribute('aria-valuenow')).toBe(
      String(expected),
    );
    expect(ref.current?.getValue()).toBe(stored);
  },
);

it.each(['disabled', 'readOnly'] as const)(
  'discards a lazy draft when entering %s and ignores its release',
  (lock) => {
    const schema = {
      type: 'number',
      format: 'slider',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    } satisfies NumberSchema;
    const ref = createRef<FormHandle>();
    const reference = sliderReference(schema);
    const form = (locked: boolean) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={2.4}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        disabled={locked && lock === 'disabled'}
        readOnly={locked && lock === 'readOnly'}
      />
    );
    const view = render(form(false));
    const thumb = view.getByRole('slider');
    fireEvent.keyDown(thumb, movement);
    expect(thumb.getAttribute('aria-valuenow')).toBe(
      String(reference.expected(2.4, movement.key)),
    );
    expect(ref.current?.getValue()).toBe(2.4);
    view.rerender(form(true));
    expect(thumb.getAttribute('aria-valuenow')).toBe(
      String(reference.displayed(2.4, lock === 'readOnly')),
    );
    view.rerender(form(false));
    fireEvent.keyUp(thumb, movement);
    expect(thumb.getAttribute('aria-valuenow')).toBe(
      String(reference.displayed(2.4, false)),
    );
    expect(ref.current?.getValue()).toBe(2.4);
    fireEvent.keyDown(thumb, movement);
    fireEvent.keyUp(thumb, movement);
    expect(ref.current?.getValue()).toBe(reference.expected(2.4, movement.key));
    act(() => ref.current?.setValue(undefined));
    const unset = view.getByRole('slider');
    expect(unset.getAttribute('aria-valuenow')).toBeNull();
    expect(unset.getAttribute('aria-valuetext')).toBe('Not set');
    fireEvent.keyDown(unset, movement);
    fireEvent.keyUp(unset, movement);
    expect(ref.current?.getValue()).toBe(
      reference.expected(undefined, movement.key),
    );
  },
);

it.each(['disabled', 'readOnly'] as const)(
  'ignores a pointer release after passing through %s',
  (lock) => {
    const schema = {
      type: 'number',
      format: 'slider',
      minimum: 0,
      maximum: 10,
      presentation: { inputType: 'slider' },
    } satisfies NumberSchema;
    const ref = createRef<FormHandle>();
    const form = (locked: boolean) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={2.4}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        disabled={locked && lock === 'disabled'}
        readOnly={locked && lock === 'readOnly'}
      />
    );
    const view = render(form(false));
    const track = view.getByRole('slider').closest<HTMLElement>('.ant-slider');
    if (!track) throw new Error('Missing slider track');
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 100, height: 10 }),
    );
    vi.spyOn(track, 'offsetWidth', 'get').mockReturnValue(100);
    try {
      fireEvent.mouseDown(track, { button: 0, buttons: 1, clientX: 60 });
      expect(view.getByRole('slider').getAttribute('aria-valuenow')).toBe('6');
      expect(ref.current?.getValue()).toBe(2.4);
      view.rerender(form(true));
      view.rerender(form(false));
      fireEvent.mouseUp(document, { button: 0, clientX: 60 });
      expect(ref.current?.getValue()).toBe(2.4);
      fireEvent.mouseDown(track, { button: 0, buttons: 1, clientX: 60 });
      fireEvent.mouseUp(document, { button: 0, clientX: 60 });
      expect(ref.current?.getValue()).toBe(sliderReference(schema).pointer(6));
    } finally {
      vi.restoreAllMocks();
    }
  },
);
