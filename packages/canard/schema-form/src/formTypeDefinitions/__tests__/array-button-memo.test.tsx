import { createRef } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

/** JSX host creation observes Button body executions without replacing components. */
const buttonRenders = vi.hoisted(() => [] as string[]);

/** Observe the memo component's own calls while retaining React's original memo. */
const removeButtonRenders = vi.hoisted(() => [] as number[]);
const removeButtonHandlers = vi.hoisted(() => [] as unknown[]);

vi.mock('react', async (importOriginal) => {
  const runtime = await importOriginal<typeof import('react') & {
    default: typeof import('react');
  }>();
  const originalMemo = runtime.memo ?? runtime.default.memo;
  const memo = (...args: Parameters<typeof runtime.memo>) => {
    if (/^Button\d*$/.test(args[0].name)) args[0] = new Proxy(args[0], {
      apply(target, receiver, parameters) {
        if (parameters[0].title === 'remove item') {
          removeButtonRenders.push(parameters[0].index);
          removeButtonHandlers.push(parameters[0].onClick);
        }
        return Reflect.apply(target, receiver, parameters);
      },
    });
    return originalMemo(...args);
  };
  return { ...runtime, default: { ...runtime.default, memo }, memo };
});

vi.mock('react/jsx-runtime', async (importOriginal) => {
  const runtime = await importOriginal<typeof import('react/jsx-runtime')>();
  return { ...runtime, jsx: (...args: Parameters<typeof runtime.jsx>) => {
    if (args[0] === 'button') buttonRenders.push((args[1] as { title: string }).title);
    return runtime.jsx(...args);
  }, jsxs: (...args: Parameters<typeof runtime.jsxs>) => {
    if (args[0] === 'button') buttonRenders.push((args[1] as { title: string }).title);
    return runtime.jsxs(...args);
  } };
});

vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const runtime = await importOriginal<typeof import('react/jsx-dev-runtime')>();
  return { ...runtime, jsxDEV: (...args: Parameters<typeof runtime.jsxDEV>) => {
    if (args[0] === 'button') buttonRenders.push((args[1] as { title: string }).title);
    return runtime.jsxDEV(...args);
  } };
});

afterEach(() => { cleanup(); buttonRenders.length = 0; removeButtonRenders.length = 0; removeButtonHandlers.length = 0; });

/** Mount distinct values so removal identity is observable through the public handle. */
async function mountArray() {
  const ref = createRef<FormHandle>();
  const values = Array.from({ length: 100 }, (_, index) => `item-${index}`);
  const view = render(<Form ref={ref} jsonSchema={{ type: 'array',
    items: { type: 'string' }, default: values }} />);
  await act(async () => {});
  buttonRenders.length = 0;
  removeButtonRenders.length = 0;
  return { ref, values, view };
}

it('executes Button once per push on an array of 100 items', async () => {
  const { ref, view } = await mountArray();
  await act(async () => { fireEvent.click(view.getByTitle('add item')); });
  expect(ref.current!.getValue()).toHaveLength(101);
  expect(buttonRenders).toEqual(['remove item']);
});

it('does not render existing remove buttons or the add button on push', async () => {
  const { view } = await mountArray();
  const existing = view.getAllByTitle('remove item');
  expect(removeButtonHandlers).toHaveLength(100);
  const sharedHandler = removeButtonHandlers[0];
  expect(removeButtonHandlers.every(handler => handler === sharedHandler)).toBe(true);
  removeButtonHandlers.length = 0;
  await act(async () => { fireEvent.click(view.getByTitle('add item')); });
  expect(view.getAllByTitle('remove item').slice(0, 100)).toEqual(existing);
  expect(buttonRenders.filter(title => title === 'remove item')).toHaveLength(1);
  expect(buttonRenders.filter(title => title === 'add item')).toHaveLength(0);
  expect(removeButtonRenders).toEqual([100]);
  expect(removeButtonHandlers).toEqual([sharedHandler]);
});

it('renders only shifted indices on remove and removes the correct shifted item', async () => {
  const { ref, values, view } = await mountArray();
  await act(async () => { fireEvent.click(view.getAllByTitle('remove item')[37]); });
  expect(ref.current!.getValue()).toEqual([...values.slice(0, 37), ...values.slice(38)]);
  expect(buttonRenders.filter(title => title === 'remove item')).toHaveLength(62);
  expect(buttonRenders.filter(title => title === 'add item')).toHaveLength(0);
  buttonRenders.length = 0;
  await act(async () => { fireEvent.click(view.getAllByTitle('remove item')[37]); });
  expect(ref.current!.getValue()).toEqual([...values.slice(0, 37), ...values.slice(39)]);
  expect(view.container.querySelectorAll('input')[37].value).toBe('item-39');
  expect(buttonRenders.filter(title => title === 'remove item')).toHaveLength(61);
});
