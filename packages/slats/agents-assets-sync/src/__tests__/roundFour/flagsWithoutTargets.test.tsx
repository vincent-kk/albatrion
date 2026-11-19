// r4-agents-assets-sync, angle EQ9: plain, --json and terminal output on the
// exit path where no target is left to inject. src/DETAIL.md:19 and
// AC-CLI-FLAGS (src/DETAIL.md:63) say an unknown --agent or --asset value
// exits 2, and src/DETAIL.md:5 that the exit code does not depend on the
// output mode. The plain path returns 0 before it validates any flag.
import { join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderJSON } from '../../commands/runCli/renderers/renderJSON.js';
import { renderPlain } from '../../commands/runCli/renderers/renderPlain.js';
import type { DefaultFlags } from '../../types/index.js';
import { InjectApp } from '../../ui/InjectApp/InjectApp.js';
import {
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

class ExitSignal extends Error {
  constructor(readonly code: number) {
    super(`exit ${code}`);
  }
}

function quiet(): void {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new ExitSignal(Number(code ?? 0));
  });
}

async function codeOf(run: () => Promise<number>): Promise<number> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ExitSignal) return error.code;
    throw error;
  }
}

function inkCode(flags: DefaultFlags, root: string): Promise<number | 'timeout'> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      app.unmount();
      resolve('timeout');
    }, 4000);
    const app = render(
      <InjectApp
        targets={[]}
        flags={flags}
        originCwd={root}
        onExit={(value) => {
          clearTimeout(timer);
          app.unmount();
          resolve(value);
        }}
      />,
    );
  });
}

describe.each([
  ['an unknown --agent', { agent: ['codx'], scope: 'project' }],
  ['an unknown --asset', { agent: ['claude'], asset: ['rule'], scope: 'project' }],
  ['an unknown --scope', { agent: ['claude'], scope: 'bad' }],
] as const)('%s with no injectable target', (_label, overrides) => {
  it('exits with the same code on the plain, --json and terminal paths', async () => {
    const root = makeRoot('r4-noflags');
    roots.push(root);
    const flags: DefaultFlags = { agent: [...overrides.agent], scope: overrides.scope, asset: "asset" in overrides ? [...overrides.asset] : undefined, interactive: true };
    quiet();
    const plain = await codeOf(() => renderPlain([], flags, root));
    const json = await codeOf(() => renderJSON([], flags, root));
    vi.restoreAllMocks();
    const ink = await inkCode(flags, root);
    expect({ plain, json, ink }).toEqual({ plain: 2, json: 2, ink: 2 });
  });
});

it('runCli: a scope alias whose members ship no agents assets rejects --agent=codx in plain mode as --json does', async () => {
  const root = makeRoot('r4-noflags-cli');
  roots.push(root);
  // A scope member without `agents.assetPath`: resolved, then soft-skipped.
  writeAt(
    join(root, 'node_modules/@probe/plain/package.json'),
    JSON.stringify({ name: '@probe/plain', version: '1.0.0' }),
  );
  const base = [
    '--package=@probe',
    '--agent=codx',
    '--scope=project',
    `--root=${root}`,
    '--no-interactive',
  ];
  const stdout = vi
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);
  const plain = await runCliCode(base);
  const json = await runCliCode([...base, '--json']);
  stdout.mockRestore();
  expect({ plain, json }).toEqual({ plain: 2, json: 2 });
});
