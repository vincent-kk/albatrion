import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Form } from '@canard/schema-form';
import { plugin } from '../index';

vi.mock('antd-mobile', async (original) => ({ ...(await original<typeof import('antd-mobile')>()), Slider: () => <div data-testid="range-slider" /> }));
afterEach(cleanup);
it('selects the range slider through the published plugin definitions', () => {
  render(<Form jsonSchema={{ type: 'array', items: { type: 'number' }, format: 'slider', presentation: { FieldInputProps: { range: true } } }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  expect(screen.queryByTestId('range-slider')).not.toBeNull();
});
