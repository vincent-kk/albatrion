import { type ComponentProps, createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../fieldInputs/FieldInputSlider';
import { selectSliderCaseIndices } from './utils/selectSliderCaseIndices';
import { sliderReference } from './utils/sliderReference';

const Input = FieldInputSliderDefinition.Component;
type InputProps = ComponentProps<typeof Input>;
let captured: InputProps | undefined;
const Capture = (props: InputProps) => {
  captured = props;
  return <Input {...props} />;
};
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
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
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('round-5 generated decimal model: every stored interaction value validates, for every bound, step, type, start and lazy mode', async () => {
  render(
    <Form
      jsonSchema={{
        type: 'number',
        format: 'slider',
        presentation: { inputType: 'slider' },
      }}
      fieldInputDefinitions={[
        { ...FieldInputSliderDefinition, Component: Capture },
      ]}
    />,
  );
  if (!captured) throw new Error('The slider definition did not provide props');
  const base = captured;
  cleanup();
  let sequence = 0,
    frameIndex = 0;
  const selected = selectSliderCaseIndices(
    [2, 7, 4, 4, 5, 17],
    process.env.SCHEMA_FORM_TEST_PROFILE !== 'pr',
  );
  const expectedSchemas = new Set<string>(),
    actualSchemas = new Set<string>();
  const expectedPairs = new Set<string>(),
    actualPairs = new Set<string>();
  const view = render(<div />);
  for (const type of ['number', 'integer'] satisfies ('number' | 'integer')[])
    for (const multipleOf of [undefined, 1, 3, 0.3, 0.1, 0.05, 1e-7]) {
      const unit = type === 'integer' ? 1 : (multipleOf ?? 1);
      const decimal = (value: number) => Number(value.toPrecision(12));
      for (const lower of ['absent', 'inclusive', 'exclusive', 'both'])
        for (const upper of ['absent', 'inclusive', 'exclusive', 'both']) {
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
            ...(multipleOf === undefined ? {} : { multipleOf }),
          };
          const reference = sliderReference({ ...schema, type });
          for (const [startIndex, start] of [
            undefined,
            reference.min,
            decimal(reference.min + reference.step / 3),
            reference.min - 2 * reference.step,
            reference.max + 2 * reference.step,
          ].entries()) {
            for (const interaction of [
              'Home',
              'End',
              'ArrowRight',
              'ArrowLeft',
              'ArrowUp',
              'ArrowDown',
              'PageUp',
              'PageDown',
              'Shift+ArrowRight',
              'Shift+ArrowLeft',
              'Shift+ArrowUp',
              'Shift+ArrowDown',
              'pointer0',
              'pointer10',
              'pointer50',
              'pointer90',
              'pointer100',
            ]) {
              const tags = [
                type,
                String(multipleOf),
                lower,
                upper,
                String(startIndex),
                interaction,
              ];
              const schemaClass = JSON.stringify(tags.slice(0, 4));
              expectedSchemas.add(schemaClass);
              const pairs: string[] = [];
              for (let left = 0; left < tags.length; left++)
                for (let right = left + 1; right < tags.length; right++)
                  pairs.push(`${left}:${tags[left]}/${right}:${tags[right]}`);
              for (const pair of pairs) expectedPairs.add(pair);
              const index = frameIndex++;
              if (selected && !selected.has(index)) continue;
              actualSchemas.add(schemaClass);
              for (const pair of pairs) actualPairs.add(pair);
              const results: unknown[] = [];
              for (const lazy of [undefined, false]) {
                if (sequence % 100 === 0) {
                  vi.clearAllMocks();
                  await act(async () => {
                    await vi.advanceTimersByTimeAsync(0);
                  });
                }
                const writes: unknown[] = [];
                view.rerender(
                  <Input
                    key={++sequence}
                    {...base}
                    jsonSchema={schema}
                    type="number"
                    schemaType={type}
                    defaultValue={start}
                    lazy={lazy}
                    onChange={(value) => writes.push(value)}
                  />,
                );
                const thumb = view.container.querySelector<HTMLElement>(
                  '[role="slider"], input[type="range"]',
                );
                if (!thumb) throw new Error('Missing slider control');
                const context = JSON.stringify({
                  schema,
                  anchor: reference.anchor,
                  start,
                  interaction,
                  lazy,
                });
                if (interaction.startsWith('pointer')) {
                  const x = Number(interaction.slice(7));
                  const track = thumb.closest('.ant-slider');
                  if (!track) throw new Error('Missing track');
                  fireEvent.mouseDown(track, {
                    button: 0,
                    buttons: 1,
                    clientX: x,
                    clientY: 0,
                  });
                  fireEvent.mouseUp(document, {
                    button: 0,
                    clientX: x,
                    clientY: 0,
                  });
                } else {
                  const key = interaction.replace('Shift+', '');
                  const codes: Record<string, number> = {
                    Home: 36,
                    End: 35,
                    ArrowRight: 39,
                    ArrowLeft: 37,
                    ArrowUp: 38,
                    ArrowDown: 40,
                    PageUp: 33,
                    PageDown: 34,
                  };
                  fireEvent.keyDown(thumb, {
                    key,
                    keyCode: codes[key],
                    which: codes[key],
                    shiftKey: interaction.startsWith('Shift+'),
                  });
                  fireEvent.keyUp(thumb, {
                    key,
                    keyCode: codes[key],
                    which: codes[key],
                    shiftKey: interaction.startsWith('Shift+'),
                  });
                  if (!reference.empty)
                    expect(writes.at(-1), context).toBe(
                      reference.expected(
                        start,
                        key,
                        interaction.startsWith('Shift+'),
                      ),
                    );
                }
                if (reference.empty) expect(writes, context).toEqual([]);
                else {
                  if (!interaction.startsWith('pointer'))
                    expect(writes.length, context).toBeGreaterThan(0);
                  for (const value of writes)
                    expect(
                      typeof value === 'number' && reference.valid(value),
                      context,
                    ).toBe(true);
                }
                results.push(writes.at(-1) ?? start);
              }
              expect(
                results[0],
                JSON.stringify({ schema, start, interaction }),
              ).toEqual(results[1]);
            }
          }
        }
    }
  expect(actualSchemas).toEqual(expectedSchemas);
  expect(actualPairs).toEqual(expectedPairs);
}, 900000);

it.each(['ltr', 'rtl'] as const)(
  'round-5 direction model (%s) preserves horizontal, vertical and endpoint keys',
  (direction) => {
    const view = render(<div />);
    for (const [type, multipleOf, start] of [
      ['number', undefined, 25],
      ['integer', 2, 24],
    ] as const) {
      const reference = sliderReference({
        type,
        multipleOf,
        minimum: 0,
        maximum: 50,
      });
      for (const lazy of [undefined, false]) {
        for (const [key, keyCode] of [
          ['ArrowLeft', 37],
          ['ArrowRight', 39],
          ['ArrowUp', 38],
          ['ArrowDown', 40],
          ['Home', 36],
          ['End', 35],
          ['PageUp', 33],
          ['PageDown', 34],
        ] as const) {
          for (const shiftKey of [false, true]) {
            const ref = createRef<FormHandle>();
            const form = (
              <Form
                key={key + shiftKey}
                ref={ref}
                jsonSchema={{
                  type,
                  minimum: 0,
                  maximum: 50,
                  multipleOf,
                  format: 'slider',
                  presentation: {
                    inputType: 'slider',
                    FieldInputProps: { lazy },
                  },
                }}
                defaultValue={start}
                fieldInputDefinitions={[FieldInputSliderDefinition]}
              />
            );
            view.rerender(
              <ConfigProvider direction={direction}>{form}</ConfigProvider>,
            );
            const thumb = view.getByRole('slider');
            const navigation = { key, keyCode, shiftKey };
            fireEvent.keyDown(thumb, navigation);
            if (lazy === undefined) expect(ref.current?.getValue()).toBe(start);
            fireEvent.keyUp(thumb, navigation);
            const directedKey =
              direction === 'rtl' && key === 'ArrowLeft'
                ? 'ArrowRight'
                : direction === 'rtl' && key === 'ArrowRight'
                  ? 'ArrowLeft'
                  : key;
            expect(
              ref.current?.getValue(),
              JSON.stringify({ type, multipleOf, lazy, key, shiftKey }),
            ).toBe(reference.expected(start, directedKey, shiftKey));
          }
        }
      }
    }
  },
);

it.each([undefined, false])(
  'round-5 read-only model preserves a valid decimal display (lazy=%s)',
  (lazy) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        readOnly
        defaultValue={1.4}
        jsonSchema={{
          type: 'number',
          minimum: 0,
          maximum: 10,
          format: 'slider',
          presentation: { inputType: 'slider', FieldInputProps: { lazy } },
        }}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
      />,
    );
    const thumb = view.getByRole('slider');
    expect(ref.current?.getValue()).toBe(1.4);
    expect(thumb.getAttribute('aria-valuenow')).toBe('1.4');
    fireEvent.keyDown(thumb, { key: 'End', keyCode: 35 });
    fireEvent.keyUp(thumb, { key: 'End', keyCode: 35 });
    expect(ref.current?.getValue()).toBe(1.4);
    expect(thumb.getAttribute('aria-valuenow')).toBe('1.4');
  },
);
