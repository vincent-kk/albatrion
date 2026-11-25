import { renderToString } from 'react-dom/server';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { Form, ValidationMode } from '../../index';

afterEach(() => vi.restoreAllMocks());

const LAYOUT_EFFECT_WARNING = 'useLayoutEffect does nothing on the server';

it('development server rendering warns about field layout effects only on React 18 and still renders the fields', () => {
  const messages: string[] = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    messages.push(args.map(String).join(' '));
  });

  const html = renderToString(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { name: { type: 'string' } },
      }}
      defaultValue={{ name: 'Ada' }}
      validationMode={ValidationMode.None}
    />,
  );

  expect(html).toContain('value="Ada"');
  expect(
    messages.some((message) => message.includes(LAYOUT_EFFECT_WARNING)),
  ).toBe(inject('reactMajor') === '18');
});
