import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputUriDefinition } from '../../fieldInputs/FieldInputUri';

afterEach(cleanup);

it('editing a URI whose scheme is not in the protocol list keeps its scheme', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputUriDefinition]}
      jsonSchema={{ type: 'string', format: 'uri' }}
      defaultValue="wss://example.com/socket"
    />,
  );
  const input = container.querySelector<HTMLInputElement>('[id=""]')
    ?? container.querySelector<HTMLInputElement>('input.ant-input')!;
  await userEvent.type(input, '2');
  expect(ref.current!.getValue()).toBe('wss://example.com/socket2');
});
