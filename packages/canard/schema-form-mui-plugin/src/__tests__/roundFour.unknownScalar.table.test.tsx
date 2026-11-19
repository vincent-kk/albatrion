import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';
import { plugin } from '../index';
beforeEach(() => vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it.each([
  { kind: 'radio', value: 'legacy' }, { kind: 'radio', value: 'null' },
  { kind: 'select', value: 'legacy' }, { kind: 'select', value: 'null' },
])('$kind preserves $value until that field is acted on', async ({ kind, value }) => {
  const ref = createRef<FormHandle>();
  const field = { type: 'string', enum: ['news', 'sports'], ...(kind === 'radio' ? { presentation: { inputType: 'radio' } } : {}) } satisfies JSONSchema;
  const { container } = render(<Form ref={ref} jsonSchema={{ type: 'object', properties: { field, other: { type: 'boolean' } } }} defaultValue={{ field: value, other: false }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  expect(ref.current!.getValue()).toEqual({ field: value, other: false });
  fireEvent.click(screen.getByRole('checkbox'));
  expect(ref.current!.getValue()).toEqual({ field: value, other: true });
  if (kind === 'radio') fireEvent.click(screen.getAllByRole('radio')[0]);
  else {
    const select = screen.queryByRole('combobox');
    if (select) {
      fireEvent.mouseDown(select);
      const option = document.querySelector('.ant-select-item-option[title="news"]') ?? screen.getAllByRole('option').find(option => option.textContent === 'news');
      expect(option).toBeDefined();
      fireEvent.click(option!);
    } else {
      // Mobile exposes its documented string input when no select definition exists.
      const input = container.querySelector<HTMLInputElement>('input[type="text"]')!;
      expect(input).not.toBeNull();
      fireEvent.change(input, { target: { value: 'news' } });
    }
  }
  expect(ref.current!.getValue()).toEqual({ field: 'news', other: true });
  await act(async () => { ref.current!.setValue({ field: undefined, other: true }); });
  expect(ref.current!.getValue()).toEqual({ other: true });
});
