import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputBooleanSwitchDefinition } from '../FieldInputBooleanSwitch';

afterEach(cleanup);

it('keeps the controlled switch mounted when its value is written from outside', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputBooleanSwitchDefinition]}
      jsonSchema={{
        type: 'boolean',
        presentation: { inputType: 'switch' },
      }}
    />,
  );
  const control = view.container.querySelector(
    '[role="switch"], input[type="checkbox"]',
  );
  expect(control).not.toBeNull();

  await act(async () => ref.current!.setValue(true));

  expect(ref.current!.getValue()).toBe(true);
  expect(
    view.container.querySelector('[role="switch"], input[type="checkbox"]'),
  ).toBe(control);
});
