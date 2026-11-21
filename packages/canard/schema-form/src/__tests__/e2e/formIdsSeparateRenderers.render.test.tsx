import React, { act, createRef } from 'react';

import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { Module, createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { Root } from 'react-dom/client';
import { expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '../../index';

const require = createRequire(import.meta.url);
const isReact18 = React.version.startsWith('18');
const schema = {
  type: 'object',
  properties: { agree: { type: 'boolean' } },
} as const;

it('keeps ids and label clicks local with distinct prefixes across renderer copies', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'schema-form-renderers-'));
  const roots: Root[] = [];
  const hosts: HTMLDivElement[] = [];
  const mount = async (identifierPrefix: string) => {
    const modules = join(directory, identifierPrefix, 'node_modules');
    const renderer = join(modules, 'react-dom');
    mkdirSync(modules, { recursive: true });
    cpSync(
      dirname(
        require.resolve(
          isReact18 ? 'react-dom18/package.json' : 'react-dom/package.json',
        ),
      ),
      renderer,
      { recursive: true },
    );
    symlinkSync(
      dirname(
        require.resolve(
          isReact18 ? 'react18/package.json' : 'react/package.json',
        ),
      ),
      join(modules, 'react'),
      'dir',
    );
    symlinkSync(
      dirname(require.resolve('scheduler/package.json')),
      join(modules, 'scheduler'),
      'dir',
    );
    const reactPath = require.resolve('react', { paths: [renderer] });
    const original = require.cache[reactPath];
    const shared = new Module(reactPath);
    shared.exports = React;
    shared.loaded = true;
    require.cache[reactPath] = shared;
    const host = document.createElement('div');
    document.body.append(host);
    hosts.push(host);
    try {
      const client: typeof import('react-dom/client') = require(
        join(renderer, 'client.js'),
      );
      const root = client.createRoot(host, { identifierPrefix });
      roots.push(root);
      const handle = createRef<FormHandle<typeof schema>>();
      await act(async () => {
        root.render(
          <Form
            ref={handle}
            jsonSchema={schema}
            validationMode={ValidationMode.None}
          />,
        );
      });
      return { createRoot: client.createRoot, host, handle };
    } finally {
      require.cache[reactPath] = original;
    }
  };
  try {
    const first = await mount('first-');
    const second = await mount('second-');
    expect(first.createRoot).not.toBe(second.createRoot);
    const ids = hosts.flatMap((host) =>
      [...host.querySelectorAll('[id]')].map((element) => element.id),
    );
    expect(ids).toContain(first.host.querySelector('input')!.id);
    expect(ids).toContain(second.host.querySelector('input')!.id);
    expect(new Set(ids).size).toBe(ids.length);
    await act(async () => second.host.querySelector('label')!.click());
    expect(first.handle.current!.getValue()).toEqual({});
    expect(second.handle.current!.getValue()).toEqual({ agree: true });
  } finally {
    await act(async () => {
      for (const root of roots) root.unmount();
    });
    for (const host of hosts) host.remove();
    rmSync(directory, { recursive: true, force: true });
  }
});
