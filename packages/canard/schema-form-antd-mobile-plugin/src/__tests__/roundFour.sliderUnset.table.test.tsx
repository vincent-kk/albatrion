import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';
import { plugin } from '../index';
afterEach(cleanup);
it.each([
  { kind: 'number', field: { type: 'number', format: 'slider', minimum: 10, maximum: 20 }, count: 1 },
  { kind: 'integer', field: { type: 'integer', format: 'slider', minimum: 10, maximum: 20 }, count: 1 },
  { kind: 'range', field: { type: 'array', format: 'slider', items: { type: 'number', minimum: 10, maximum: 20 } }, count: 2 },
] satisfies { kind: string; field: JSONSchema; count: number }[])('unset $kind announces absence until the first selection', ({ field, count }) => {
  const ref = createRef<FormHandle>();
  const { unmount } = render(<Form ref={ref} jsonSchema={field} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  const thumbs = screen.getAllByRole('slider');
  expect(thumbs).toHaveLength(count);
  expect(ref.current!.getValue()).toBeUndefined();
  expect(thumbs.map(thumb => thumb.getAttribute('aria-valuenow'))).toEqual(Array(count).fill(null));
  expect(thumbs.every(thumb => thumb.getAttribute('aria-valuetext') === 'Not set')).toBe(true);
  fireEvent.keyDown(thumbs[0], { key: 'Home' });
  const result = ref.current!.getValue();
  expect(result).toEqual(count === 2 ? [10, 10] : 10);
  const announced = screen.getAllByRole('slider').map(thumb => thumb.getAttribute('aria-valuenow'));
  unmount();
  render(<Form jsonSchema={field} defaultValue={result} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  expect(screen.getAllByRole('slider').map(thumb => thumb.getAttribute('aria-valuenow'))).toEqual(announced);
});
