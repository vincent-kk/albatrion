import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

// Probe for r5-ids: EQ5, renderToString followed by hydrateRoot keeps ids and references.
// Verification level: public API (@canard/schema-form dist, plugin source), React 19.

const PLUGIN_NAME = 'mui';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    plan: {
      type: 'string',
      enum: ['free', 'pro'],
      presentation: { inputType: 'radio' },
    },
    tags: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    choice: { type: 'string', enum: ['x', 'y'] },
    site: { type: 'string', format: 'uri' },
    agree: { type: 'boolean' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['a', 'b'],
            presentation: { inputType: 'radio' },
          },
        },
      },
    },
  },
};

const defaultValue = {
  name: 'n',
  plan: 'pro',
  tags: ['b'],
  choice: 'y',
  site: 'https://a.b',
  agree: true,
  rows: [{ kind: 'a' }, { kind: 'b' }],
};

const App = () => (
  <Form
    jsonSchema={schema}
    defaultValue={defaultValue}
    fieldInputDefinitions={plugin.fieldInputDefinitions}
    FieldRenderer={plugin.FieldRenderer}
    LabelRenderer={plugin.LabelRenderer}
    ErrorMessageRenderer={plugin.ErrorMessageRenderer}
  />
);

const snapshot = (host: HTMLElement) => ({
  ids: Array.from(host.querySelectorAll('[id]'), (e) => e.id),
  fors: Array.from(host.querySelectorAll('label[for]'), (e) =>
    e.getAttribute('for'),
  ),
  labelledby: Array.from(host.querySelectorAll('[aria-labelledby]'), (e) =>
    e.getAttribute('aria-labelledby'),
  ),
  names: Array.from(host.querySelectorAll('input[type="radio"]'), (e) =>
    e.getAttribute('name'),
  ),
});

describe(`${PLUGIN_NAME}: server render then hydration`, () => {
  it('hydrates without recoverable errors and keeps every id, for and labelledby', async () => {
    const host = document.createElement('div');
    host.innerHTML = renderToString(<App />);
    document.body.append(host);
    const server = snapshot(host);
    const recoverable: unknown[] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(host, <App />, {
        onRecoverableError: (error) => recoverable.push(String(error)),
      });
    });
    const client = snapshot(host);
    const hydrationErrors = consoleError.mock.calls
      .map((call) => String(call[0]))
      .filter((message) => /hydrat|did not match|mismatch/i.test(message));
    consoleError.mockRestore();
    await act(async () => root!.unmount());
    expect({ recoverable, hydrationErrors }).toEqual({
      recoverable: [],
      hydrationErrors: [],
    });
    expect(client.fors).toEqual(server.fors);
    expect(client.labelledby).toEqual(server.labelledby);
    for (const id of server.ids) expect(client.ids).toContain(id);
  });
});
