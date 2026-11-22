import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, expect, it, vi } from 'vitest';

import { renderOrFallback } from '../../commands/runCli/renderers/renderOrFallback.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';
import { InjectApp } from '../../ui/InjectApp/InjectApp.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  sha256,
  writeAt,
} from './fixture.js';

const faults = vi.hoisted(() => ({ kind: '' }));
vi.mock('../../core/injectDocs/utils/applyAction.js', async (load) => {
  const actual =
    await load<typeof import('../../core/injectDocs/utils/applyAction.js')>();
  return {
    applyAction: async (...args: Parameters<typeof actual.applyAction>) => {
      if (
        (faults.kind === 'copy' && args[0].kind === 'copy') ||
        (faults.kind === 'delete' && args[0].kind === 'delete')
      )
        throw new Error('injected IO failure');
      return actual.applyAction(...args);
    },
  };
});

class FlagExit extends Error {
  constructor(readonly code: number) {
    super('flag rejected');
  }
}

const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
  faults.kind = '';
});

/** Builds equivalent independent inputs for every renderer. */
function setup(kind: string, root: string): ConsumerPackage[] {
  const names = kind === 'mixed' ? ['good', 'blocked', 'partial'] : [kind];
  return names.map((name) => {
    const packageRoot = installPackage(root, {
      name: `@probe/${name}`,
      assets: { [`skills/${name}/SKILL.md`]: '# shipped\n' },
      ...(name === 'partial' ? { manifestText: '{' } : {}),
      ...(name === 'stale'
        ? { manifest: { 'skills/stale/SKILL.md': sha256('# old\n') } }
        : {}),
    });
    if (name === 'blocked')
      writeAt(join(root, `.claude/skills/${name}/SKILL.md`), '# user edit\n');
    if (name === 'delete')
      writeAt(join(root, `.claude/skills/${name}/old.md`), '# orphan\n');
    return consumerOf(
      packageRoot,
      `@probe/${name}`,
      name === 'partial' || name === 'stale' ? 'manifest' : 'directory',
    );
  });
}

/** Captures the user-visible unit names and filesystem result, alongside exit status. */
async function run(
  surface: 'plain' | 'json' | 'ink',
  kind: string,
  force: boolean,
  dryRun = false,
  overrides: Partial<DefaultFlags> = {},
) {
  const root = makeRoot('surface');
  roots.push(root);
  const targets = setup(kind, root);
  const flags: DefaultFlags = {
    agent: ['claude'],
    scope: 'project',
    force,
    yes: true,
    dryRun,
    interactive: true,
    ...overrides,
  };
  let transcript = '';
  const record = (chunk: string | Uint8Array) => {
    transcript += String(chunk);
    return true;
  };
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    transcript += args.join(' ');
  });
  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    transcript += args.join(' ');
  });
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    transcript += args.join(' ');
  });
  vi.spyOn(process.stdout, 'write').mockImplementation(record);
  vi.spyOn(process.stderr, 'write').mockImplementation(record);
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new FlagExit(Number(code ?? 0));
  });
  faults.kind = kind;
  let code: number | 'timeout';
  try {
    if (surface === 'ink') {
      code = await new Promise<number | 'timeout'>((resolve) => {
        const timer = setTimeout(() => {
          app.unmount();
          resolve('timeout');
        }, 8000);
        const app = render(
          <InjectApp
            targets={targets}
            flags={flags}
            originCwd={root}
            onExit={(value) => {
              clearTimeout(timer);
              transcript = app.lastFrame() ?? '';
              app.unmount();
              resolve(value);
            }}
          />,
        );
      });
    } else
      code = await renderOrFallback(
        targets,
        { ...flags, json: surface === 'json' },
        root,
        [],
        { isTTY: false },
      );
  } catch (error) {
    if (!(error instanceof FlagExit)) throw error;
    code = error.code;
  }
  vi.restoreAllMocks();
  return {
    code,
    reconciled: transcript.includes('source-hash-reconciled'),
    units: targets
      .filter((target) => transcript.includes(target.name))
      .map((target) => target.name),
    applied: targets.map((target) =>
      existsSync(
        join(root, `.claude/skills/${target.name.split('/')[1]}/SKILL.md`),
      ),
    ),
  };
}

it.each([
  ['good', false],
  ['good', true],
  ['blocked', false],
  ['blocked', true],
  ['partial', false],
  ['partial', true],
  ['copy', false],
  ['copy', true],
  ['delete', false],
  ['delete', true],
  ['mixed', false],
  ['mixed', true],
  ['stale', false],
  ['stale', true],
  ['blocked', false, true],
  ['blocked', true, true],
  ['partial', false, true],
  ['partial', true, true],
] as const)(
  'reports equivalent units and exit codes for %s, force=%s',
  async (kind, force, dryRun: boolean = false) => {
    const plain = await run('plain', kind, force, dryRun);
    if (kind === 'stale') expect(plain.reconciled).toBe(true);
    expect(await run('json', kind, force, dryRun)).toEqual(plain);
    expect(await run('ink', kind, force, dryRun)).toEqual(plain);
  },
);

it.each([
  { asset: ['rule'] },
  { agent: ['codx'] },
  { agent: ['claude', 'codx'] },
  { scope: 'bad' },
])(
  'rejects flags equivalently across output surfaces: %j',
  async (overrides) => {
    const plain = await run('plain', 'good', false, false, overrides);
    expect(plain.code).toBe(2);
    expect(await run('json', 'good', false, false, overrides)).toEqual(plain);
    expect(await run('ink', 'good', false, false, overrides)).toEqual(plain);
  },
);
