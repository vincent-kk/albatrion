import { createRef } from 'react';

import { ThemeProvider, createTheme } from '@mui/material';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { selectSliderCaseIndices } from '../../__tests__/utils/selectSliderCaseIndices';
import { sliderReference } from '../../__tests__/utils/sliderReference';
import { FieldInputSliderDefinition } from '../FieldInputSlider';

/** Every directed lock transition appears exactly once in this circuit. */
const modes = [0, 1, 2, 0, 2, 1, 0] as const;
/** A key that has no stored effect during either locked mode. */
const movement = { key: 'ArrowRight', keyCode: 39 };

const directionsThemes = {
  ltr: createTheme({ direction: 'ltr' }),
  rtl: createTheme({ direction: 'rtl' }),
};

afterEach(cleanup);

it('models slider display and retained values through all mounted lock transitions', () => {
  const types = ['number', 'integer'] as const;
  const steps = [undefined, 1, 3, 0.3, 0.1, 0.05, 1e-7];
  const markKinds = [0, 1];
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
                      FieldInputProps: {
                        lazy,
                        showMarks:
                          markKind !== 0 &&
                          (grid.max - grid.min) / grid.step < 30,
                      },
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
                  const theme = directionsThemes[direction];
                  let thumb: HTMLElement | undefined;
                  for (const mode of modes) {
                    view.rerender(
                      <ThemeProvider theme={theme}>{form(mode)}</ThemeProvider>,
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
}, 900000);
