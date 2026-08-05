// filid:contract AC-RUNCLI-RESOLVE
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  type MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { logger } from '../../../utils/logger.js';
import { resolvePackage } from '../targets/resolvePackage.js';

vi.mock('../../../utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const errorMock = vi.mocked(logger.error);
const warnMock = vi.mocked(logger.warn);

function makePkg(dir: string, body: Record<string, unknown>): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify(body));
}

describe('resolvePackage', () => {
  let root: string;
  let exitSpy: MockInstance<(code?: number) => never>;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'resolve-package-'));
    errorMock.mockClear();
    warnMock.mockClear();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    exitSpy.mockRestore();
  });

  // 3 basic happy-path cases.
  it('resolves a scoped package from <originCwd>/node_modules', async () => {
    const dir = join(root, 'node_modules', '@fixture', 'with-asset');
    makePkg(dir, {
      name: '@fixture/with-asset',
      version: '1.0.0',
      agents: { assetPath: 'docs/agents' },
    });

    const meta = await resolvePackage('@fixture/with-asset', {}, root);

    expect(meta).not.toBeNull();
    expect(meta!.packageName).toBe('@fixture/with-asset');
    expect(meta!.packageVersion).toBe('1.0.0');
    expect(meta!.assetPath).toBe('docs/agents');
    expect(meta!.packageRoot).toBe(realpathSync(dir));
  });

  it('resolves an unscoped package from <originCwd>/node_modules', async () => {
    const dir = join(root, 'node_modules', 'fixture-unscoped');
    makePkg(dir, {
      name: 'fixture-unscoped',
      version: '0.1.0',
      agents: { assetPath: 'assets' },
    });

    const meta = await resolvePackage('fixture-unscoped', {}, root);

    expect(meta!.packageName).toBe('fixture-unscoped');
    expect(meta!.assetPath).toBe('assets');
  });

  it('exits 2 when neither cwd nor engine resolves the package', async () => {
    await expect(
      resolvePackage('this-package-does-not-exist-zzz', {}, root),
    ).rejects.toThrow('process.exit(2)');
    expect(exitSpy).toHaveBeenCalledWith(2);
    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining('cannot resolve package'),
    );
  });

  // Edge cases (FCA-AI 3+12 cap).
  it('walks up ancestor node_modules from a nested originCwd', async () => {
    const deepCwd = join(root, 'apps', 'web', 'src');
    mkdirSync(deepCwd, { recursive: true });
    const dir = join(root, 'node_modules', '@fixture', 'deep');
    makePkg(dir, {
      name: '@fixture/deep',
      version: '2.0.0',
      agents: { assetPath: 'docs/agents' },
    });

    const meta = await resolvePackage('@fixture/deep', {}, deepCwd);

    expect(meta!.packageName).toBe('@fixture/deep');
    expect(meta!.packageVersion).toBe('2.0.0');
  });

  it('falls back to engine-rooted resolution when cwd misses', async () => {
    // The engine has `commander` in its own dependencies but the
    // commander package lacks `agents.assetPath`. Resolving `commander`
    // from an empty cwd must:
    // 1) fail the cwd-rooted require (no commander in <root>/node_modules),
    // 2) succeed the engine-rooted require, and
    // 3) report "missing agents.assetPath" — proving the fallback fired.
    await expect(resolvePackage('commander', {}, root)).rejects.toThrow(
      'process.exit(2)',
    );
    const errorArgs = errorMock.mock.calls.map((c) => String(c[0]));
    expect(errorArgs.some((m) => m.includes('agents.assetPath'))).toBe(true);
    expect(errorArgs.some((m) => m.includes('cannot resolve package'))).toBe(
      false,
    );
  });

  it('returns null when skipMissingAsset and agents.assetPath is absent', async () => {
    const dir = join(root, 'node_modules', '@fixture', 'no-asset');
    makePkg(dir, { name: '@fixture/no-asset', version: '1.0.0' });

    const meta = await resolvePackage(
      '@fixture/no-asset',
      { skipMissingAsset: true },
      root,
    );

    expect(meta).toBeNull();
    expect(warnMock).toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('exits 2 in strict mode when agents.assetPath is absent', async () => {
    const dir = join(root, 'node_modules', '@fixture', 'no-asset-strict');
    makePkg(dir, {
      name: '@fixture/no-asset-strict',
      version: '1.0.0',
    });

    await expect(
      resolvePackage('@fixture/no-asset-strict', {}, root),
    ).rejects.toThrow('process.exit(2)');
    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining('agents.assetPath'),
    );
  });

  it('exits 2 when package.json lacks a string name/version', async () => {
    const dir = join(root, 'node_modules', '@fixture', 'malformed');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: '@fixture/malformed' }),
    );

    await expect(
      resolvePackage('@fixture/malformed', {}, root),
    ).rejects.toThrow('process.exit(2)');
    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining('"name" and "version"'),
    );
  });

  it('returns null on malformed package.json when skipMissingAsset is true', async () => {
    const dir = join(root, 'node_modules', '@fixture', 'malformed-skip');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: '@fixture/malformed-skip' }),
    );

    const meta = await resolvePackage(
      '@fixture/malformed-skip',
      { skipMissingAsset: true },
      root,
    );

    expect(meta).toBeNull();
    expect(warnMock).toHaveBeenCalled();
  });

  it('prefers cwd-rooted resolution over engine-rooted when both could match', async () => {
    // Set up a fixture in cwd whose name shadows a hypothetical engine
    // dependency. Even if the engine could also resolve some package
    // with the same name, the cwd hit must win.
    const dir = join(root, 'node_modules', 'commander');
    makePkg(dir, {
      name: 'commander',
      version: '99.99.99',
      agents: { assetPath: 'docs/agents' },
    });

    const meta = await resolvePackage('commander', {}, root);

    expect(meta!.packageVersion).toBe('99.99.99');
    expect(meta!.assetPath).toBe('docs/agents');
    expect(meta!.packageRoot).toBe(realpathSync(dir));
  });

  // The asset root is where every byte this tool injects is read from, and
  // `.claude/skills/**` is read back as agent instructions. Containment is
  // therefore judged on the resolved location, not the spelling — and it is
  // judged the same whether the path was declared or passed as a flag.
  describe('asset root containment', () => {
    it('rejects a declared assetPath that escapes the package', async () => {
      const dir = join(root, 'node_modules', '@fixture', 'escaper');
      makePkg(dir, {
        name: '@fixture/escaper',
        version: '1.0.0',
        agents: { assetPath: '../neighbour/agents' },
      });
      mkdirSync(join(root, 'node_modules', '@fixture', 'neighbour', 'agents'), {
        recursive: true,
      });

      await expect(
        resolvePackage('@fixture/escaper', {}, root),
      ).rejects.toThrow('process.exit(2)');
    });

    // `resolve()` is lexical and `stat()` follows links, so a symlinked asset
    // root reads as "inside" while pointing anywhere on disk.
    it.each([
      ['declared', undefined],
      ['flag-supplied', 'agents'],
    ])(
      'rejects a %s asset root that is a symlink out of the package',
      async (_label, override) => {
        const outside = join(root, 'outside');
        mkdirSync(outside, { recursive: true });
        const dir = join(root, 'node_modules', '@fixture', 'linked');
        makePkg(dir, {
          name: '@fixture/linked',
          version: '1.0.0',
          agents: { assetPath: 'agents' },
        });
        symlinkSync(outside, join(dir, 'agents'));

        await expect(
          resolvePackage(
            '@fixture/linked',
            override === undefined ? {} : { assetPathOverride: override },
            root,
          ),
        ).rejects.toThrow('process.exit(2)');
      },
    );
  });
});
