import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  ValidationMode,
  isTerminalNode,
} from '../../index';

/** Specific leaf selected before the shared descendant pattern. */
const ColorInput = () => <input aria-label="Theme color" />;
/** Descendant patterns include branches, which must retain their child slots. */
const SettingsInput = (props: FieldInputProps) => (
  <section data-testid={props.path}>
    {!isTerminalNode(props.node) &&
      props.ChildFields.map((Child) => <Child key={Child.key} />)}
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

it('keeps an exact exception before a shared descendant input', () => {
  const view = render(
    <Form
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
  expect(view.getByTestId('/settings/theme/size')).toBeTruthy();
  expect(view.queryByTestId('/settings')).toBeNull();
});
