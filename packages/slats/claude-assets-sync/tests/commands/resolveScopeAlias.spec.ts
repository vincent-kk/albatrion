import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

// Mock `resolvePackage`: return a minimal `ResolvedMetadata` whose
// `packageName` echoes the requested name. `resolveScopeAlias` only
// forwards names it has already vetted against the declared
// `package.json` `name`, so a straight echo is enough to verify the
// enumeration wiring and dedup semantics.
vi.mock('../../src/commands/runCli/utils/resolvePackage.js', () => ({
  resolvePackage: vi.fn(async (name: string) => ({
    packageRoot: `/fake/${name}`,
    packageName: name,
    packageVersion: '0.0.0',
    assetPath: 'docs/claude',
  })),
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { resolvePackage } from '../../src/commands/runCli/utils/resolvePackage.js';
import { resolveScopeAlias } from '../../src/commands/runCli/utils/resolveScopeAlias.js';

const resolvePackageMock = vi.mocked(resolvePackage);

function makePkg(
  dir: string,
  name: string,
  extra: Record<string, unknown> = {},
): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name, version: '0.0.0', ...extra }),
  );
}

describe('resolveScopeAlias', () => {
  let root: string;
  let exitSpy: MockInstance<(code?: number) => never>;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'resolve-scope-alias-'));
    resolvePackageMock.mockClear();
    exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: number) => {
        throw new Error(`process.exit(${code})`);
      }) as never);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    exitSpy.mockRestore();
  });

  // 3 happy-path cases — the three behaviors the CLI actually relies on.
  it('collects @<scope>/ packages from the rootCwd node_modules', async () => {
    makePkg(
      join(root, 'node_modules', '@canard', 'schema-form'),
      '@canard/schema-form',
    );
    makePkg(
      join(root, 'node_modules', '@canard', 'schema-form-plugin'),
      '@canard/schema-form-plugin',
    );

    const result = await resolveScopeAlias('canard', root);

    const names = result.map((m) => m.packageName).sort();
    expect(names).toEqual(['@canard/schema-form', '@canard/schema-form-plugin']);
  });

  it('walks up through ancestor node_modules directories', async () => {
    const deep = join(root, 'apps', 'web', 'src');
    mkdirSync(deep, { recursive: true });
    makePkg(
      join(root, 'node_modules', '@winglet', 'react-utils'),
      '@winglet/react-utils',
    );
    makePkg(
      join(root, 'apps', 'node_modules', '@winglet', 'data-loader'),
      '@winglet/data-loader',
    );

    const result = await resolveScopeAlias('winglet', deep);

    const names = result.map((m) => m.packageName).sort();
    expect(names).toEqual(['@winglet/data-loader', '@winglet/react-utils']);
  });

  it('passes each matched name through resolvePackage with skipMissingAsset: true', async () => {
    makePkg(
      join(root, 'node_modules', '@lerx', 'promise-modal'),
      '@lerx/promise-modal',
    );

    await resolveScopeAlias('lerx', root);

    expect(resolvePackageMock).toHaveBeenCalledWith(
      '@lerx/promise-modal',
      { skipMissingAsset: true },
      root,
    );
  });

  // 12 edge cases (FCA-AI 3+12 cap).
  it('respects the declared `name` over the directory basename', async () => {
    makePkg(
      join(root, 'node_modules', '@canard', 'renamed-dir'),
      '@canard/real-name',
    );

    const result = await resolveScopeAlias('canard', root);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/real-name']);
  });

  it('filters out entries whose declared name is in a different scope', async () => {
    makePkg(join(root, 'node_modules', '@canard', 'foo'), '@other/foo');
    makePkg(join(root, 'node_modules', '@canard', 'bar'), '@canard/bar');

    const result = await resolveScopeAlias('canard', root);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/bar']);
  });

  it('dedupes by package name using nearest-wins across ancestors', async () => {
    const deep = join(root, 'pkgs', 'app');
    mkdirSync(deep, { recursive: true });
    makePkg(
      join(root, 'pkgs', 'node_modules', '@winglet', 'common-utils'),
      '@winglet/common-utils',
    );
    makePkg(
      join(root, 'node_modules', '@winglet', 'common-utils'),
      '@winglet/common-utils',
    );

    const result = await resolveScopeAlias('winglet', deep);

    expect(result.map((m) => m.packageName)).toEqual(['@winglet/common-utils']);
    expect(resolvePackageMock).toHaveBeenCalledTimes(1);
  });

  it('skips dot-prefixed entries (.bin, .cache, etc.)', async () => {
    mkdirSync(join(root, 'node_modules', '@canard', '.bin'), {
      recursive: true,
    });
    mkdirSync(join(root, 'node_modules', '@canard', '.cache'), {
      recursive: true,
    });
    makePkg(
      join(root, 'node_modules', '@canard', 'schema-form'),
      '@canard/schema-form',
    );

    const result = await resolveScopeAlias('canard', root);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/schema-form']);
  });

  it('skips entries missing package.json', async () => {
    mkdirSync(join(root, 'node_modules', '@canard', 'broken'), {
      recursive: true,
    });
    makePkg(join(root, 'node_modules', '@canard', 'ok'), '@canard/ok');

    const result = await resolveScopeAlias('canard', root);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/ok']);
  });

  it('skips entries with malformed package.json', async () => {
    const brokenDir = join(root, 'node_modules', '@canard', 'broken');
    mkdirSync(brokenDir, { recursive: true });
    writeFileSync(join(brokenDir, 'package.json'), '{ not valid json');
    makePkg(join(root, 'node_modules', '@canard', 'ok'), '@canard/ok');

    const result = await resolveScopeAlias('canard', root);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/ok']);
  });

  it('skips package.json whose name is not a string', async () => {
    const badDir = join(root, 'node_modules', '@canard', 'bad');
    mkdirSync(badDir, { recursive: true });
    writeFileSync(join(badDir, 'package.json'), JSON.stringify({ name: 42 }));
    makePkg(join(root, 'node_modules', '@canard', 'good'), '@canard/good');

    const result = await resolveScopeAlias('canard', root);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/good']);
  });

  it('rejects a bare "@<scope>/" declared name with no segment after', async () => {
    const bareDir = join(root, 'node_modules', '@canard', 'empty-name');
    mkdirSync(bareDir, { recursive: true });
    writeFileSync(
      join(bareDir, 'package.json'),
      JSON.stringify({ name: '@canard/' }),
    );
    makePkg(join(root, 'node_modules', '@canard', 'real'), '@canard/real');

    const result = await resolveScopeAlias('canard', root);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/real']);
  });

  it('continues the ancestor walk when some levels lack the scope directory', async () => {
    const deep = join(root, 'a', 'b', 'c');
    mkdirSync(deep, { recursive: true });
    makePkg(
      join(root, 'node_modules', '@canard', 'schema-form'),
      '@canard/schema-form',
    );

    const result = await resolveScopeAlias('canard', deep);

    expect(result.map((m) => m.packageName)).toEqual(['@canard/schema-form']);
  });

  it('exits with code 2 when zero matches are found', async () => {
    const empty = join(root, 'empty');
    mkdirSync(empty, { recursive: true });

    await expect(resolveScopeAlias('nowhere', empty)).rejects.toThrow(
      'process.exit(2)',
    );
    expect(exitSpy).toHaveBeenCalledWith(2);
  });

  it('exits 2 even when rootCwd is the filesystem root with nothing installed', async () => {
    // dirname('/') === '/', so the ancestor loop terminates in one step;
    // with no scope dir at `/`, the enumeration yields zero matches.
    await expect(
      resolveScopeAlias('never-installed-scope-xyz-zzz', '/'),
    ).rejects.toThrow('process.exit(2)');
  });

  it('preserves discovery order (nearest ancestor first)', async () => {
    const deep = join(root, 'apps', 'web');
    mkdirSync(deep, { recursive: true });
    makePkg(
      join(root, 'node_modules', '@winglet', 'z-far'),
      '@winglet/z-far',
    );
    makePkg(
      join(root, 'apps', 'node_modules', '@winglet', 'a-near'),
      '@winglet/a-near',
    );

    const result = await resolveScopeAlias('winglet', deep);

    expect(result.map((m) => m.packageName)).toEqual([
      '@winglet/a-near',
      '@winglet/z-far',
    ]);
  });
});
