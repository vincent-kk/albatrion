import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
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

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { resolvePackage } from '../../src/commands/runCli/utils/resolvePackage.js';
import { logger } from '../../src/utils/logger.js';

const errorMock = vi.mocked(logger.error);
const warnMock = vi.mocked(logger.warn);

function makePkg(
  dir: string,
  body: Record<string, unknown>,
): void {
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

  // 3 basic happy-path cases.
  it('resolves a scoped package from <originCwd>/node_modules', async () => {
    const dir = join(root, 'node_modules', '@fixture', 'with-asset');
    makePkg(dir, {
      name: '@fixture/with-asset',
      version: '1.0.0',
      claude: { assetPath: 'docs/claude' },
    });

    const meta = await resolvePackage('@fixture/with-asset', {}, root);

    expect(meta).not.toBeNull();
    expect(meta!.packageName).toBe('@fixture/with-asset');
    expect(meta!.packageVersion).toBe('1.0.0');
    expect(meta!.assetPath).toBe('docs/claude');
    expect(meta!.packageRoot).toBe(realpathSync(dir));
  });

  it('resolves an unscoped package from <originCwd>/node_modules', async () => {
    const dir = join(root, 'node_modules', 'fixture-unscoped');
    makePkg(dir, {
      name: 'fixture-unscoped',
      version: '0.1.0',
      claude: { assetPath: 'assets' },
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
      claude: { assetPath: 'docs/claude' },
    });

    const meta = await resolvePackage('@fixture/deep', {}, deepCwd);

    expect(meta!.packageName).toBe('@fixture/deep');
    expect(meta!.packageVersion).toBe('2.0.0');
  });

  it('falls back to engine-rooted resolution when cwd misses', async () => {
    // The engine has `commander` in its own dependencies but the
    // commander package lacks `claude.assetPath`. Resolving `commander`
    // from an empty cwd must:
    // 1) fail the cwd-rooted require (no commander in <root>/node_modules),
    // 2) succeed the engine-rooted require, and
    // 3) report "missing claude.assetPath" — proving the fallback fired.
    await expect(resolvePackage('commander', {}, root)).rejects.toThrow(
      'process.exit(2)',
    );
    const errorArgs = errorMock.mock.calls.map((c) => String(c[0]));
    expect(errorArgs.some((m) => m.includes('claude.assetPath'))).toBe(true);
    expect(errorArgs.some((m) => m.includes('cannot resolve package'))).toBe(
      false,
    );
  });

  it('returns null when skipMissingAsset and claude.assetPath is absent', async () => {
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

  it('exits 2 in strict mode when claude.assetPath is absent', async () => {
    const dir = join(root, 'node_modules', '@fixture', 'no-asset-strict');
    makePkg(dir, {
      name: '@fixture/no-asset-strict',
      version: '1.0.0',
    });

    await expect(
      resolvePackage('@fixture/no-asset-strict', {}, root),
    ).rejects.toThrow('process.exit(2)');
    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining('claude.assetPath'),
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
      claude: { assetPath: 'docs/claude' },
    });

    const meta = await resolvePackage('commander', {}, root);

    expect(meta!.packageVersion).toBe('99.99.99');
    expect(meta!.assetPath).toBe('docs/claude');
    expect(meta!.packageRoot).toBe(realpathSync(dir));
  });
});
