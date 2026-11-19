import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Form, type FormHandle } from '@canard/schema-form';
import { plugin } from '../index';
afterEach(cleanup);
it.each(['legacy', 'null', null, 0, false, { legacy: 'data' }, ['legacy']])('preserves untouched JSON value %j through checkbox toggles', unknown => {
  const results = [];
  let stored: unknown;
  for (const usePlugin of [false, true]) {
    const ref = createRef<FormHandle>();
    const { unmount } = render(<Form ref={ref} jsonSchema={{ type: 'array', items: { type: 'string', enum: ['news', 'sports'] }, presentation: { inputType: 'checkbox' } }} defaultValue={[unknown, 'sports']} {...(usePlugin ? { fieldInputDefinitions: plugin.fieldInputDefinitions } : {})} />);
    const initial = ref.current!.getValue();
    expect(Array.isArray(initial)).toBe(true);
    if (Array.isArray(initial)) {
      if (!usePlugin) stored = initial[0];
      expect(initial).toEqual([stored, 'sports']);
    }
    const steps = [];
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    steps.push(ref.current!.getValue());
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    steps.push(ref.current!.getValue());
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    steps.push(ref.current!.getValue());
    results.push(steps);
    unmount();
  }
  expect(results[1]).toEqual(results[0]);
  expect(results[0]).toEqual([[stored, 'sports', 'news'], [stored, 'news'], [stored]]);
});
