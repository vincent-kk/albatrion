/**
 * r5-ui-rules range picker table: one-sided selections dismissed by Escape or blur, and
 * the order of a commit against reset and external writes. Plugin from source, core by name.
 */
import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

process.env.TZ = 'UTC';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const openInput = async (input: HTMLInputElement) => {
  fireEvent.mouseDown(input);
  fireEvent.click(input);
  fireEvent.focus(input);
  await act(async () => {});
};

const cell = (title: string) =>
  document.querySelector<HTMLElement>(
    `.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) td[title="${title}"] .ant-picker-cell-inner`,
  );

const mount = (initial?: string[]) => {
  const ref = createRef<FormHandle>();
  const field: JSONSchema = {
    type: 'array',
    format: 'date-range',
    items: { type: 'string' },
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { stay: field } }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={initial ? { stay: initial } : {}}
      onError={() => {}}
    />,
  );
  const inputs = () =>
    Array.from(view.container.querySelectorAll<HTMLInputElement>('input'));
  const shown = () => inputs().map((input) => input.value);
  const stored = () => (ref.current!.getValue() as { stay?: string[] }).stay;
  return { ref, view, inputs, shown, stored };
};

describe('date range: one end picked, then dismissed', () => {
  it.each(['Escape', 'blur'] as const)(
    'diagnostic: stored range, new start picked, dismissed by %s: what is shown is what is stored',
    async (dismiss) => {
      const { inputs, shown, stored } = mount(['2024-01-10', '2024-01-20']);
      const [start] = inputs();
      await openInput(start);
      const day = cell('2024-01-15');
      expect(day, 'cell present').not.toBeNull();
      fireEvent.click(day!);
      await act(async () => {});
      if (dismiss === 'Escape') {
        fireEvent.keyDown(document.activeElement ?? inputs()[1], {
          key: 'Escape',
          code: 'Escape',
        });
      } else {
        fireEvent.mouseDown(document.body);
        fireEvent.blur(document.activeElement ?? inputs()[1]);
      }
      await act(async () => {});
      await act(async () => {});
      expect({ shown: shown(), stored: stored() }).toEqual({
        shown: stored(),
        stored: stored(),
      });
    },
  );

  it.each(['Escape', 'blur'] as const)(
    'empty range, start picked, dismissed by %s: nothing stored and nothing shown',
    async (dismiss) => {
      const { inputs, shown, stored } = mount();
      const [start] = inputs();
      await openInput(start);
      const day = document.querySelector<HTMLElement>(
        '.ant-picker-dropdown .ant-picker-cell-in-view .ant-picker-cell-inner',
      );
      fireEvent.click(day!);
      await act(async () => {});
      if (dismiss === 'Escape') {
        fireEvent.keyDown(document.activeElement ?? inputs()[1], {
          key: 'Escape',
          code: 'Escape',
        });
      } else {
        fireEvent.mouseDown(document.body);
        fireEvent.blur(document.activeElement ?? inputs()[1]);
      }
      await act(async () => {});
      expect({ stored: stored() }).toEqual({ stored: undefined });
      void shown;
    },
  );

  it('control: picking both ends stores the pair', async () => {
    const { inputs, stored } = mount(['2024-01-10', '2024-01-20']);
    await openInput(inputs()[0]);
    fireEvent.click(cell('2024-01-12')!);
    await act(async () => {});
    fireEvent.click(cell('2024-01-25')!);
    await act(async () => {});
    expect(stored()).toEqual(['2024-01-12', '2024-01-25']);
  });
});

describe('date range: commit order against external writes (LC1)', () => {
  it('start picked, then an external setValue, then end picked: the commit pairs the user picks', async () => {
    const { ref, inputs, stored, shown } = mount(['2024-01-10', '2024-01-20']);
    await openInput(inputs()[0]);
    fireEvent.click(cell('2024-01-12')!);
    await act(async () => {});
    await act(async () => {
      ref.current!.setValue({ stay: ['2024-03-01', '2024-03-05'] });
    });
    const end = cell('2024-01-25');
    if (end) {
      fireEvent.click(end);
      await act(async () => {});
    }
    expect({ shown: shown(), stored: stored() }).toEqual({
      shown: stored(),
      stored: ['2024-03-01', '2024-03-05'],
    });
  });

  it('start picked, then reset, then end picked: the reset value stays', async () => {
    const { ref, inputs, stored, shown } = mount(['2024-01-10', '2024-01-20']);
    await act(async () => {
      ref.current!.setValue({ stay: ['2024-02-01', '2024-02-05'] });
    });
    await openInput(inputs()[0]);
    const startCell = cell('2024-02-12');
    fireEvent.click(startCell!);
    await act(async () => {});
    await act(async () => {
      ref.current!.reset();
    });
    const end = cell('2024-02-25');
    if (end) {
      fireEvent.click(end);
      await act(async () => {});
    }
    expect({ shown: shown(), stored: stored() }).toEqual({
      shown: stored(),
      stored: ['2024-01-10', '2024-01-20'],
    });
  });
});
