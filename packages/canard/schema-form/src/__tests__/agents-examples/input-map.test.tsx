import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
  isTerminalNode,
} from '../../index';

/** Specific leaf selected before the shared descendant pattern. */
const ColorInput = () => <input aria-label="Theme color" />;
/** Descendant patterns include branches, which must retain their child slots. */
const SettingsInput = (props: FieldInputProps) =>
  isTerminalNode(props.node) ? (
    <input
      aria-label={props.path}
      defaultValue={String(props.defaultValue ?? '')}
      onChange={(event) => props.onChange(event.target.value)}
    />
  ) : (
    <section data-testid={props.path}>
      {props.ChildFields.map((Child) => (
        <Child key={Child.key} />
      ))}
    </section>
  );

// prettier-ignore
const mapProps = {
fieldInputMap: {
  '/settings/theme/color': ColorInput,
  '^/settings/': SettingsInput,
}
};

afterEach(cleanup);

it('keeps an exact exception and renders branch children or an editable terminal input', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          settings: {
            type: 'object',
            properties: {
              theme: {
                type: 'object',
                properties: {
                  color: { type: 'string' },
                  size: { type: 'string' },
                },
              },
            },
          },
        },
      }}
      fieldInputMap={mapProps.fieldInputMap}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.getByLabelText('Theme color')).toBeTruthy();
  expect(view.getByTestId('/settings/theme')).toBeTruthy();
  const size = view.getByLabelText('/settings/theme/size');
  fireEvent.change(size, { target: { value: 'large' } });
  expect(ref.current?.getValue()).toEqual({
    settings: { theme: { size: 'large' } },
  });
  expect(view.queryByTestId('/settings')).toBeNull();
});
