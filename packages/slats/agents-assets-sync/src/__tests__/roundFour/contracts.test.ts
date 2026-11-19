import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as entry from '../../index';
import { resolveProjectRoot } from '../../index';

const packageDir = resolve(__dirname, '../../..');
const repositoryRoot = resolve(packageDir, '../../..');
const requireFromHere = createRequire(__filename);

/** Named imports of the first fenced block that imports the package entry. */
const importedNames = (markdown: string) => {
  const block = /import\s*\{([^}]*)\}\s*from\s*'@slats\/agents-assets-sync';/.exec(
    markdown,
  );
  if (!block) throw new Error('no programmatic API import found');
  return block[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
};

describe('r4-contracts agents-assets-sync documented imports', () => {
  it('control: every name in the English README Programmatic API import is exported', () => {
    const names = importedNames(readFileSync(join(packageDir, 'README.md'), 'utf8'));
    expect(names.filter((name) => !(name in entry))).toEqual([]);
  });

  it('every name in the Korean README Programmatic API import is exported by the package entry', () => {
    const names = importedNames(
      readFileSync(join(packageDir, 'README-ko_kr.md'), 'utf8'),
    );
    expect(names.filter((name) => !(name in entry))).toEqual([]);
  });
});

describe('r4-contracts site guidance for --scope=project', () => {
  const pages = [
    'winglet/common-utils',
    'winglet/data-loader',
    'winglet/react-utils',
    'winglet/style-utils',
    'winglet/json',
    'winglet/json-schema',
    'lerx/promise-modal',
  ].map((page) => join(repositoryRoot, 'documents/docs', page, 'index.mdx'));

  it('the site pages promise the nearest existing .claude walking up from cwd', () => {
    const claims = pages.filter((page) =>
      readFileSync(page, 'utf8').includes(
        '# Into the nearest existing .claude, walking up from cwd',
      ),
    );
    expect(claims).toHaveLength(7);
  });

  it('--scope=project lands in the nearest existing .claude, as the seven site pages state', () => {
    const outer = realpathSync(mkdtempSync(join(tmpdir(), 'r4-contracts-scope-')));
    mkdirSync(join(outer, '.git'));
    const member = join(outer, 'apps', 'web');
    mkdirSync(join(member, '.claude'), { recursive: true });
    // A workspace member that already owns .claude, inside a repository root.
    const { projectRoot } = resolveProjectRoot('project', member);
    expect(projectRoot).toBe(member);
  });

  it('control: without a root marker the nearest existing .claude is chosen', () => {
    const outer = realpathSync(mkdtempSync(join(tmpdir(), 'r4-contracts-scope-')));
    const member = join(outer, 'apps', 'web');
    mkdirSync(join(member, '.claude'), { recursive: true });
    expect(resolveProjectRoot('project', join(member)).projectRoot).toBe(member);
  });
});

describe('r4-contracts CommonJS consumer of an ESM-only export map', () => {
  const makeConsumer = () => {
    const root = mkdtempSync(join(tmpdir(), 'r4-contracts-cjs-'));
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ name: 'consumer', private: true, type: 'commonjs' }),
    );
    const link = join(root, 'node_modules', '@slats/agents-assets-sync');
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(packageDir, link, 'dir');
    symlinkSync(
      join(repositoryRoot, 'node_modules/@types'),
      join(root, 'node_modules/@types'),
      'dir',
    );
    const file = join(root, 'index.cts');
    writeFileSync(
      file,
      "import { readHashManifest } from '@slats/agents-assets-sync';\nexport const used = readHashManifest;\n",
    );
    return { root, file };
  };

  it('TypeScript (module nodenext) and Node agree on whether require() of the package works', () => {
    const ts = requireFromHere('typescript') as typeof import('typescript');
    const { root, file } = makeConsumer();
    const program = ts.createProgram([file], {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2022,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: ['node'],
    });
    const consumerDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.file?.fileName === file);
    const runtime = spawnSync(
      process.execPath,
      ['-e', "require('@slats/agents-assets-sync')"],
      { cwd: root, encoding: 'utf8' },
    );
    const typeScript = consumerDiagnostics.length === 0 ? 'accepted' : 'rejected';
    const node =
      runtime.status === 0
        ? 'accepted'
        : `rejected ${/ERR_[A-Z_]+/.exec(runtime.stderr)?.[0] ?? ''}`;
    expect({ typeScript, node }).toEqual({ typeScript: node, node });
  });
});
