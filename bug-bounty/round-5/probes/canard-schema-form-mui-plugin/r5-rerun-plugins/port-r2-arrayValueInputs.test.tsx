// Port of round 2 MUI `arrayValueInputs.test.tsx` (round 2 item 1, high; cause in the core). Only the option
// lookup changed: the round 2 probe read option ids (`/checks-"a"`), which the round 4 identifier design
// replaced with opaque ids. Options are read by their position in the enum instead.
import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

afterEach(cleanup);

const checkedOf = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  )
    .map((box, index) => (box.checked ? ["a", "b", "c"][index] : null))
    .filter(Boolean);

const schema = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b', 'c'] },
      presentation: { inputType: 'checkbox' },
    },
  },
} as const;

it('checkbox group shows a same-length value written through FormHandle.setValue', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={{ checks: ['a'] }}
    />,
  );
  expect(checkedOf(container)).toEqual(['a']);
  await act(async () => ref.current!.setValue({ checks: ['b'] }));
  expect(ref.current!.getValue()).toEqual({ checks: ['b'] });
  expect(checkedOf(container)).toEqual(['b']);
});

it('checkbox group shows a value written to an item node', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={{ checks: ['a'] }}
    />,
  );
  await act(async () => ref.current!.findNode('/checks/0')!.setValue('c'));
  expect(ref.current!.getValue()).toEqual({ checks: ['c'] });
  expect(checkedOf(container)).toEqual(['c']);
});

it('a toggle after an unseen external write keeps the external value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={{ checks: ['a'] }}
    />,
  );
  await act(async () => ref.current!.setValue({ checks: ['b'] }));
  // The user adds "c" to what the form holds.
  const boxC = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[2];
  await act(async () => boxC.click());
  expect(ref.current!.getValue()).toEqual({ checks: ['b', 'c'] });
});
