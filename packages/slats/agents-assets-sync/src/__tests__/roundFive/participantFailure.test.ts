import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from '../../__tests__/roundThree/fixture.js';
import { renderJSON } from '../../commands/runCli/renderers/renderJSON.js';
import { renderPlain } from '../../commands/runCli/renderers/renderPlain.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

function quiet(): void {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
}

async function run(
  mode: 'plain' | 'json',
  root: string,
  targets: ConsumerPackage[],
  extra: Partial<DefaultFlags> = {},
): Promise<number> {
  quiet();
  try {
    return await (mode === 'plain' ? renderPlain : renderJSON)(
      targets,
      { agent: ['claude'], scope: 'project', yes: true, ...extra },
      root,
    );
  } finally {
    vi.restoreAllMocks();
  }
}

type Failure = 'unclosed-fence-rule' | 'missing-source-file';

function setup(failure: Failure) {
  const root = makeRoot('r5-participant');
  roots.push(root);
  const a = installPackage(root, {
    name: '@probe/a',
    assets: { 'skills/shared/a.md': '# a\n' },
    manifest: true,
  });
  const bAssets = {
    'skills/shared/b.md': '# b\n',
    'rules/b-rule.md': '# rule\n\n```ts\nconst x = 1;\n```\n',
  };
  const b = installPackage(root, {
    name: '@probe/b',
    assets: bAssets,
    manifest: true,
  });
  const targets = [
    consumerOf(a, '@probe/a', 'manifest'),
    consumerOf(b, '@probe/b', 'manifest'),
  ];
  return {
    root,
    targets,
    breakB() {
      if (failure === 'unclosed-fence-rule') {
        // An unclosed source fence refuses the participant before any write.
        const body = '# rule\n\n```ts\nconst x = 1;\n';
        installPackage(root, {
          name: '@probe/b',
          version: '1.1.0',
          assets: { ...bAssets, 'rules/b-rule.md': body },
          manifest: true,
        });
      } else {
        // The built manifest lists a file the package no longer contains.
        installPackage(root, {
          name: '@probe/b',
          version: '1.1.0',
          assets: bAssets,
          manifest: {
            'rules/b-rule.md': '0'.repeat(64),
            'rules/gone.md': '1'.repeat(64),
            'skills/shared/b.md':
              '5b1be70a0a9b0d5f4a3e3d2c2d5b2a0f0a1d7e0d0e0f0a1b2c3d4e5f60718293',
          },
        });
      }
    },
  };
}

it.each([
  ['plain', 'unclosed-fence-rule'],
  ['json', 'unclosed-fence-rule'],
  ['plain', 'missing-source-file'],
] as const)(
  '%s: --force keeps the installed files of a participant whose unit failed (%s)',
  async (mode, failure) => {
    const { root, targets, breakB } = setup(failure);
    const first = await run(mode, root, targets);
    const bFile = join(root, '.claude/skills/shared/b.md');
    const installed = existsSync(bFile);
    breakB();
    const forced = await run(mode, root, targets, { force: true });
    expect({ first, installed, forced, bKept: existsSync(bFile) }).toEqual({
      first: 0,
      installed: true,
      forced: 1,
      bKept: true,
    });
  },
);

it.each([
  ['two named packages', ['--package=@probe/a,@probe/b']],
  ['the scope alias', ['--package=@probe']],
])(
  'runCli (%s): --force --yes keeps the files of a participant whose unit failed',
  async (_label, packageArgs) => {
    const { root, breakB } = setup('unclosed-fence-rule');
    const args = [
      ...packageArgs,
      '--agent=claude',
      '--scope=project',
      '--no-interactive',
      `--root=${root}`,
    ];
    const first = await runCliCode(args);
    breakB();
    const forced = await runCliCode([...args, '--force', '--yes']);
    expect({
      first,
      forced,
      bKept: existsSync(join(root, '.claude/skills/shared/b.md')),
    }).toEqual({ first: 0, forced: 1, bKept: true });
  },
);

it('control: without --force the failing participant blocks nothing and deletes nothing', async () => {
  const { root, targets, breakB } = setup('unclosed-fence-rule');
  await run('plain', root, targets);
  breakB();
  const code = await run('plain', root, targets);
  expect({
    code,
    bKept: existsSync(join(root, '.claude/skills/shared/b.md')),
  }).toEqual({ code: 1, bKept: true });
});

it('control: a participant that plans successfully keeps its files under --force', async () => {
  const { root, targets } = setup('unclosed-fence-rule');
  await run('plain', root, targets);
  writeAt(join(root, 'unrelated.txt'), 'x');
  const forced = await run('plain', root, targets, { force: true });
  expect({
    forced,
    bKept: existsSync(join(root, '.claude/skills/shared/b.md')),
  }).toEqual({ forced: 0, bKept: true });
});
