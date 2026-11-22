import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * r5-release, angles EQ3 and EQ5: a server render through the `node` export condition target
 * (`dist/index.node.mjs`) hydrated by the default browser target (`dist/index.mjs`), as an SSR
 * framework that applies the `node` condition on the server and not in the browser does.
 * Both are the built bundles at the base commit.
 */
const packageDir = resolve(__dirname, '../../..');
const load = (file: string) => import(pathToFileURL(join(packageDir, 'dist', file)).href);

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    age: { type: 'number', title: 'Age' },
    agree: { type: 'boolean', title: 'Agree' },
    plan: { type: 'string', enum: ['free', 'pro'], title: 'Plan', presentation: { inputType: 'radio' } },
    tags: { type: 'array', items: { type: 'string' }, title: 'Tags' },
    nested: { type: 'object', properties: { city: { type: 'string', title: 'City' } } },
  },
} as const;
const defaultValue = { name: 'Ada', age: 36, agree: true, plan: 'pro', tags: ['a', 'b'], nested: { city: 'Seoul' } };

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('r5-release server bundle hydrated by the browser bundle', () => {
  it('index.node.mjs server HTML hydrates under index.mjs without recoverable errors', async () => {
    const server = await load('index.node.mjs');
    const client = await load('index.mjs');
    expect(server.Form).not.toBe(client.Form);
    const consoleErrors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => consoleErrors.push(String(args[0]).slice(0, 160)));
    const html = renderToString(<server.Form jsonSchema={schema} defaultValue={defaultValue} />);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const recoverable: string[] = [];
    await act(async () => {
      hydrateRoot(container, <client.Form jsonSchema={schema} defaultValue={defaultValue} />, {
        onRecoverableError: (error) => recoverable.push(String((error as Error).message).slice(0, 160)),
      });
    });
    // React 18 development SSR layout-effect warnings are a documented limit (round-2 FIXES, schema-form 11).
    const unexpected = consoleErrors.filter((message) => !message.includes('useLayoutEffect does nothing on the server'));
    expect({ recoverable, unexpected }).toEqual({ recoverable: [], unexpected: [] });
  });

  it('control: the same bundle on both sides hydrates without recoverable errors', async () => {
    const client = await load('index.mjs');
    const html = renderToString(<client.Form jsonSchema={schema} defaultValue={defaultValue} />);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const recoverable: string[] = [];
    await act(async () => {
      hydrateRoot(container, <client.Form jsonSchema={schema} defaultValue={defaultValue} />, {
        onRecoverableError: (error) => recoverable.push(String((error as Error).message).slice(0, 160)),
      });
    });
    expect(recoverable).toEqual([]);
  });
});
