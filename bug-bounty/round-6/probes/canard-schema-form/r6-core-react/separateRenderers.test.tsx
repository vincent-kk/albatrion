// Loaded by Vitest render/react18 projects; isolated react-dom copies model two separately bundled client applications.
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import * as React from 'react';
import { afterEach, expect, it } from 'vitest';
import { Form, ValidationMode } from '../../index';

const require = createRequire(import.meta.url);
const isReact18 = React.version.startsWith('18');
const domName = isReact18 ? 'react-dom18' : 'react-dom';
const reactName = isReact18 ? 'react18' : 'react';
const mounts: { root: any; host: HTMLDivElement; directory: string }[] = [];
const checkbox = { type: 'object', properties: { agree: { type: 'boolean' } } } as const;
const radio = {
  type: 'object',
  properties: { plan: { type: 'string', enum: ['basic', 'pro'], presentation: { inputType: 'radio' } } },
} as const;

async function mountCopy(jsonSchema: any, identifierPrefix?: string) {
  const directory = mkdtempSync(join(tmpdir(), 'r6-reactdom-'));
  const modules = join(directory, 'node_modules');
  mkdirSync(modules);
  cpSync(dirname(require.resolve(domName + '/package.json')), join(modules, 'react-dom'), { recursive: true });
  symlinkSync(dirname(require.resolve(reactName + '/package.json')), join(modules, 'react'), 'dir');
  symlinkSync(dirname(require.resolve('scheduler/package.json')), join(modules, 'scheduler'), 'dir');
  if (isReact18) {
    // The react18 project pre-bundles React; hand the copy that same instance so hooks share one dispatcher.
    const resolved = require.resolve('react', { paths: [join(modules, 'react-dom')] });
    const instance = (React as any).default ?? React;
    require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports: instance } as any;
  }
  const client = require(join(modules, 'react-dom/client.js'));
  const host = document.createElement('div');
  document.body.append(host);
  const root = client.createRoot(host, identifierPrefix ? { identifierPrefix } : undefined);
  mounts.push({ root, host, directory });
  const handle = React.createRef<any>();
  await React.act(async () => root.render(React.createElement(Form, {
    ref: handle, jsonSchema, validationMode: ValidationMode.None,
  })));
  return { client, host, handle };
}

afterEach(async () => {
  for (const { root, host, directory } of mounts.splice(0)) {
    await React.act(async () => root.unmount());
    host.remove();
    rmSync(directory, { recursive: true, force: true });
  }
});

it('probe validity: each application runs its own react-dom copy sharing one React', async () => {
  const a = await mountCopy(checkbox);
  const b = await mountCopy(checkbox);
  expect(a.client.createRoot).not.toBe(b.client.createRoot);
  expect(a.handle.current).toBeTruthy();
  expect(b.handle.current).toBeTruthy();
});

it('independent client applications keep Form ids unique without SSR prefixes', async () => {
  await mountCopy(checkbox);
  await mountCopy(checkbox);
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

it('a label in the second client application toggles only its own form', async () => {
  const a = await mountCopy(checkbox);
  const b = await mountCopy(checkbox);
  await React.act(async () => b.host.querySelector('label')!.click());
  expect({ first: a.handle.current.getValue(), second: b.handle.current.getValue() }).toEqual({
    first: {}, second: { agree: true },
  });
});

it('hypothesis (passes): radio groups stay separate because each Form owns a native form element', async () => {
  const a = await mountCopy(radio);
  const b = await mountCopy(radio);
  const aBasic = a.host.querySelector<HTMLInputElement>('input[type="radio"][value="basic"]')!;
  const bPro = b.host.querySelector<HTMLInputElement>('input[type="radio"][value="pro"]')!;
  await React.act(async () => aBasic.click());
  await React.act(async () => bPro.click());
  expect(JSON.stringify({
    firstChecked: aBasic.checked,
    first: a.handle.current.getValue(),
    second: b.handle.current.getValue(),
  })).toBe(JSON.stringify({ firstChecked: true, first: { plan: 'basic' }, second: { plan: 'pro' } }));
});

it('control: distinct client identifierPrefix values keep labels local', async () => {
  const a = await mountCopy(checkbox, 'a-');
  const b = await mountCopy(checkbox, 'b-');
  await React.act(async () => b.host.querySelector('label')!.click());
  expect({ first: a.handle.current.getValue(), second: b.handle.current.getValue() }).toEqual({
    first: {}, second: { agree: true },
  });
});
