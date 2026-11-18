import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
const props = {
  fieldInputDefinitions: plugin.fieldInputDefinitions,
  FieldRenderer: plugin.FieldRenderer,
  LabelRenderer: plugin.LabelRenderer,
};

it('names the slider handle in server HTML while completing its id at hydration (round-3 id review 5)', () => {
  const form = (
    <Form
      {...props}
      jsonSchema={{
        type: 'object',
        properties: {
          Field: { type: 'number', presentation: { inputType: 'slider' } },
        },
      }}
      defaultValue={{ Field: 3 }}
    />
  );
  const server = document.createElement('div');
  server.innerHTML = renderToString(form);
  const handle = server.querySelector<HTMLElement>('[role="slider"]')!;
  const title = server.querySelector<HTMLLabelElement>('label')!;
  expect(handle.getAttribute('aria-labelledby')).toBe(title.id);
  expect(handle.id).toBe('');
  const view = render(form);
  const mounted = view.container.querySelector<HTMLElement>('[role="slider"]')!;
  expect(mounted.id).toContain(':/Field');
  expect(mounted.getAttribute('aria-labelledby')).toBe(
    view.container.querySelector('label')!.id,
  );
});
