import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Form } from '@canard/schema-form';
import { FieldInputBooleanSwitchDefinition } from '../FieldInputBooleanSwitch';
afterEach(cleanup);
it('preserves the exact switch composition when state labels are absent', () => {
  const { container } = render(<Form jsonSchema={{ type: 'boolean', presentation: { inputType: 'switch' } }} defaultValue={false} fieldInputDefinitions={[FieldInputBooleanSwitchDefinition]} />);
  const control = screen.getByRole('switch');
  expect(container.querySelector('label')!.outerHTML.replaceAll(control.id, 'field')).toMatchSnapshot();
});
