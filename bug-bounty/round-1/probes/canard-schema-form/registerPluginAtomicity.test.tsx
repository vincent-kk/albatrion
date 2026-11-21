import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldRendererProps,
  Form,
  type SchemaFormPlugin,
  ValidationMode,
  registerPlugin,
} from '../../index';

afterEach(() => {
  cleanup();
  registerPlugin(null);
});

const Marked = ({ Input }: FieldRendererProps) => (
  <div data-marked="">
    <Input />
  </div>
);

it('a registerPlugin call that throws leaves no part of that plugin applied', () => {
  const broken = {
    FieldRenderer: Marked,
    fieldInputDefinitions: [null],
  } as unknown as SchemaFormPlugin;
  expect(() => registerPlugin(broken)).toThrow();
  const view = render(
    <Form jsonSchema={{ type: 'string' }} validationMode={ValidationMode.None} />,
  );
  expect(view.container.querySelector('[data-marked]')).toBeNull();
});
