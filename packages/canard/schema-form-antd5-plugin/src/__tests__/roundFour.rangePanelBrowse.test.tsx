import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;
afterEach(cleanup);

const originalZone = process.env.TZ;
afterAll(() => {
  process.env.TZ = originalZone;
});

const openFirst = async (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>('input')!;
  fireEvent.mouseDown(input);
  fireEvent.click(input);
  fireEvent.focus(input);
  await act(async () => {});
  return input;
};

const panelButton = (selector: string) =>
  document.querySelector<HTMLElement>(`.ant-picker-dropdown ${selector}`);

const mount = (field: JSONSchema, initial: readonly string[]) => {
  const ref = createRef<FormHandle>();
  const changes: unknown[] = [];
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { value: field } }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ value: [...initial] }}
      onChange={(value) => changes.push(value)}
      onError={() => {}}
    />,
  );
  return { ref, changes, ...view };
};

describe.each(['UTC', 'Asia/Seoul'])('time zone %s', (zone) => {
  beforeAll(() => {
    process.env.TZ = zone;
  });

  describe.each([
    [
      'date-range',
      { type: 'array', format: 'date-range', items: { type: 'string' } },
      ['2024-01-10', '2024-01-12'],
      '.ant-picker-header-next-btn',
    ],
    [
      'month-range',
      { type: 'array', format: 'month-range', items: { type: 'string' } },
      ['2024-01', '2024-03'],
      '.ant-picker-header-super-next-btn',
    ],
    [
      'time-range',
      { type: 'array', format: 'time-range', items: { type: 'string' } },
      ['09:00:00Z', '18:00:00Z'],
      '.ant-picker-header-next-btn',
    ],
  ] as const)('%s', (_name, field, initial, nextSelector) => {
    it('control: opening the panel alone leaves the stored range unchanged', async () => {
      const { ref, container } = mount(field, initial);
      await openFirst(container);
      expect(ref.current!.getValue()).toEqual({ value: [...initial] });
    });

    it('browsing to the next page of the panel leaves the stored range unchanged', async () => {
      const { ref, container } = mount(field, initial);
      await openFirst(container);
      const next = panelButton(nextSelector);
      expect(next, 'next button present').not.toBeNull();
      fireEvent.click(next!);
      await act(async () => {});
      expect(ref.current!.getValue()).toEqual({ value: [...initial] });
    });

    it('browsing to the previous page of the panel leaves the stored range unchanged', async () => {
      const { ref, container } = mount(field, initial);
      await openFirst(container);
      const previous = panelButton(nextSelector.replace('next', 'prev'));
      expect(previous, 'previous button present').not.toBeNull();
      fireEvent.click(previous!);
      await act(async () => {});
      expect(ref.current!.getValue()).toEqual({ value: [...initial] });
    });

    it('browsing then dismissing with Escape shows the value the form stores', async () => {
      const { ref, container } = mount(field, initial);
      const input = await openFirst(container);
      fireEvent.click(panelButton(nextSelector)!);
      await act(async () => {});
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      await act(async () => {});
      const shown = Array.from(
        container.querySelectorAll<HTMLInputElement>('input'),
        (element) => element.value,
      );
      const stored = ref.current!.getValue();
      expect({ shown, stored }).toEqual({
        shown,
        stored: { value: [...initial] },
      });
    });
  });
});

it('an empty date range stays empty after choosing a start day and browsing to the next month', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          stay: {
            type: 'array',
            format: 'date-range',
            items: { type: 'string' },
          },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      onError={() => {}}
    />,
  );
  await openFirst(container);
  const day = document.querySelector<HTMLElement>(
    '.ant-picker-dropdown .ant-picker-cell-in-view .ant-picker-cell-inner',
  )!;
  fireEvent.click(day);
  await act(async () => {});
  fireEvent.click(panelButton('.ant-picker-header-next-btn')!);
  await act(async () => {});
  expect(ref.current!.getValue()).toEqual({});
});

it('saves both virtual date constituents on range completion and restores both on reset (virtual storage contract)', async () => {
  const ref = createRef<FormHandle>();
  const initial = { start: '2024-01-10', end: '2024-01-20' };
  const dateRange = plugin.fieldInputDefinitions.find(
    ({ test }) =>
      typeof test === 'function' &&
      test({
        type: 'array',
        schemaType: 'array',
        format: 'date-range',
        path: '/period',
        misfit: false,
        nullable: false,
        required: false,
        jsonSchema: {
          type: 'array',
          format: 'date-range',
          items: { type: 'string' },
        },
      }),
  );
  if (!dateRange) throw new Error('The plugin must expose a date range input');
  const { container } = render(
    <Form
      ref={ref}
      defaultValue={initial}
      jsonSchema={{
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date' },
          end: { type: 'string', format: 'date' },
        },
        options: {
          virtual: {
            period: {
              fields: ['start', 'end'],
              presentation: {
                FieldInput: dateRange.Component,
              },
            },
          },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    >
      <Form.Label path="/period" />
      <Form.Input path="/period" />
    </Form>,
  );
  const inputs = () =>
    Array.from(
      container.querySelectorAll<HTMLInputElement>('.ant-picker input'),
    );
  expect(inputs()).toHaveLength(2);
  await openFirst(container);
  const select = async (day: string) => {
    const cell = document.querySelector<HTMLElement>(
      `.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) td[title="${day}"] .ant-picker-cell-inner`,
    );
    expect(cell).not.toBeNull();
    fireEvent.click(cell!);
    await act(async () => {});
  };
  await select('2024-01-12');
  expect(ref.current!.getValue()).toEqual(initial);
  await select('2024-01-25');
  expect(ref.current!.getValue()).toEqual({
    start: '2024-01-12',
    end: '2024-01-25',
  });
  await act(async () => ref.current!.reset());
  expect(ref.current!.getValue()).toEqual(initial);
  expect(inputs().map((input) => input.value)).toEqual([
    initial.start,
    initial.end,
  ]);
});
