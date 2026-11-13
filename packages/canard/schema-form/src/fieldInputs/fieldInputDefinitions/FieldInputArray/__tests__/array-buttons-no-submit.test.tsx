import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';

afterEach(cleanup);

/** Let a native submit, if one was dispatched, finish its asynchronous validation and callback. */
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

it('adds and removes items without submitting the surrounding form', async () => {
  const onSubmit = vi.fn();
  const view = render(
    <Form
      jsonSchema={{ type: 'array', items: { type: 'string' }, default: ['a'] }}
      onSubmit={onSubmit}
    />,
  );
  await settle();
  fireEvent.click(view.getByTitle('add item'));
  await settle();
  fireEvent.click(view.getAllByTitle('remove item')[0]);
  await settle();
  expect(onSubmit).not.toHaveBeenCalled();
  expect(
    [...view.container.querySelectorAll('button')].map(({ type }) => type),
  ).toEqual(['button', 'button']);
});
