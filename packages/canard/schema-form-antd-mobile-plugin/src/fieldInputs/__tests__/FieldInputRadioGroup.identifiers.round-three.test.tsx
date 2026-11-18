import type { ComponentProps } from 'react';

import { cleanup, render, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';

afterEach(cleanup);
it('names newly rendered radio options while the field id stays unchanged (round-3 id review 5)', async () => {
  const Component = FieldInputRadioGroupDefinition.Component;
  type Props = ComponentProps<typeof Component>;
  let captured: Props | undefined;
  const Capture = (props: Props) => {
    captured = props;
    return <Component {...props} />;
  };
  const host = render(
    <Form
      fieldInputDefinitions={[
        { ...FieldInputRadioGroupDefinition, Component: Capture },
      ]}
      jsonSchema={{
        type: 'string',
        enum: ['one', 'two'],
        presentation: { inputType: 'radio' },
      }}
    />,
  );
  if (!captured) throw new Error('The input definition was not selected');
  const props = captured;
  host.unmount();
  const view = render(<Component {...props} />);
  expect(
    Array.from(
      view.container.querySelectorAll<HTMLInputElement>('input'),
      (input) => input.name,
    ),
  ).toEqual([props.id, props.id]);
  fireEvent.click(view.container.querySelectorAll('input')[1]);
  await waitFor(() => expect(Array.from(view.container.querySelectorAll<HTMLInputElement>('input'), input => input.name)).toEqual([props.id, props.id]));
  view.rerender(
    <Component
      {...props}
      jsonSchema={{ ...props.jsonSchema, enum: ['one', 'two', 'three'] }}
    />,
  );
  const inputs = view.container.querySelectorAll<HTMLInputElement>('input');
  expect(inputs).toHaveLength(3);
  expect(Array.from(inputs, (input) => input.name)).toEqual([
    props.id,
    props.id,
    props.id,
  ]);
});
