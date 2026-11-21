import { createElement } from 'react';
import type { ComponentType } from 'react';
import * as React from 'react';
import * as JSX from 'react/jsx-runtime';

import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { JsxEmit, ModuleKind, transpileModule } from 'typescript';
import { afterEach, expect, it, vi } from 'vitest';

import * as api from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});
it('runs the actual published useInitializeModal JSDoc without changing component identities', () => {
  const source = readFileSync(
    'src/bootstrap/BootstrapProvider/useBootstrap.tsx',
    'utf8',
  );
  const example =
    source.match(/```tsx([\s\S]*?)```/)?.[1].replace(/^\s*\* ?/gm, '') ?? '';
  expect(example).toContain('useInitializeModal');
  const output = transpileModule(`${example}\nexport { App };`, {
    compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX },
  }).outputText;
  const module: { exports: { App?: ComponentType } } = { exports: {} };
  const require = (name: string) => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return JSX;
    if (name === '@lerx/promise-modal') return api;
    throw new Error(`Unexpected example import: ${name}`);
  };
  new Function('require', 'module', 'exports', output)(
    require,
    module,
    module.exports,
  );
  if (!module.exports.App) throw new Error('Example must export App');
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(createElement(module.exports.App));
  expect(warn.mock.calls).toEqual([]);
});
