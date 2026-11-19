import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { agree: { type: ['boolean', 'null'] } },
} satisfies JSONSchema;

/**
 * EQ11: antd5, antd6 and antd-mobile derive `indeterminate` from the live value, so a click on a
 * null checkbox clears the mixed state. MUI derives it from the mount-time defaultValue.
 */
it('a nullable checkbox loaded as null leaves the mixed state once the user checks it', () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ agree: null }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  const box = container.querySelector(
    'input[type="checkbox"]',
  ) as HTMLInputElement;
  expect(box.getAttribute('data-indeterminate')).toBe('true');
  fireEvent.click(box);
  expect(ref.current!.getValue()).toEqual({ agree: true });
  expect(box.getAttribute('data-indeterminate')).toBe('false');
  expect(
    container.querySelector('[data-testid="IndeterminateCheckBoxIcon"]'),
  ).toBeNull();
  expect(
    container.querySelector('[data-testid="CheckBoxIcon"]'),
  ).not.toBeNull();
});
