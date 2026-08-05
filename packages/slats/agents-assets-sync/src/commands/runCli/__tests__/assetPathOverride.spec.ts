// filid:contract AC-RUNCLI-ASSET-PATH
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
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
import { resolveAssetPathFlag } from '../flags/resolveAssetPathFlag.js';
import { resolvePackage } from '../targets/resolvePackage.js';
import { toConsumerPackages } from '../targets/toConsumerPackages.js';

vi.mock('../../../utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const errorMock = vi.mocked(logger.error);
const warnMock = vi.mocked(logger.warn);

let root: string;
let exitSpy: MockInstance<(code?: number) => never>;

/** Install a fixture package and, optionally, an asset directory inside it. */
function makePkg(
  relDir: string,
  body: Record<string, unknown>,
  assetDir?: string,
): string {
  const dir = join(root, 'node_modules', relDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify(body));
  if (assetDir) mkdirSync(join(dir, assetDir), { recursive: true });
  return realpathSync(dir);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'asset-path-override-'));
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

describe('resolveAssetPathFlag', () => {
  it('passes an unset flag through untouched', () => {
    expect(resolveAssetPathFlag(undefined)).toBeUndefined();
  });

  it('accepts a relative path and trims it', () => {
    expect(resolveAssetPathFlag('  docs/agents  ')).toBe('docs/agents');
  });

  // The shape checks that hold for every target, whatever package it is.
  it.each([
    ['empty', ''],
    ['blank', '   '],
    ['absolute', '/etc/agents'],
    ['home-relative', '~/agents'],
  ])('exits 2 on a %s value', (_label, value) => {
    expect(() => resolveAssetPathFlag(value)).toThrow('process.exit(2)');
    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining('Invalid --asset-path'),
    );
  });
});

describe('resolvePackage with an override', () => {
  it('wins over a declared agents.assetPath', async () => {
    makePkg(
      '@fixture/declared',
      {
        name: '@fixture/declared',
        version: '1.0.0',
        agents: { assetPath: 'docs/agents' },
      },
      'agents',
    );

    const meta = await resolvePackage(
      '@fixture/declared',
      { assetPathOverride: 'agents' },
      root,
    );

    expect(meta!.assetPath).toBe('agents');
    expect(meta!.assetPathSource).toBe('flag');
  });

  it('resolves a package that declares nothing', async () => {
    makePkg(
      '@fixture/undeclared',
      { name: '@fixture/undeclared', version: '2.0.0' },
      'agents',
    );

    const meta = await resolvePackage(
      '@fixture/undeclared',
      { assetPathOverride: 'agents' },
      root,
    );

    expect(meta!.assetPath).toBe('agents');
    expect(meta!.assetPathSource).toBe('flag');
    expect(errorMock).not.toHaveBeenCalled();
  });

  it('reports package as the source when no override is given', async () => {
    makePkg('@fixture/plain', {
      name: '@fixture/plain',
      version: '1.0.0',
      agents: { assetPath: 'docs/agents' },
    });

    const meta = await resolvePackage('@fixture/plain', {}, root);

    expect(meta!.assetPathSource).toBe('package');
  });

  // The override is user input applied to every target, so each package
  // judges it against its own root. `../neighbour/agents` is a real directory
  // on disk — only the containment check rejects it, which is what makes that
  // clause load-bearing here.
  it.each([
    ['a missing directory', 'nowhere'],
    ['a path escaping the package root', '../neighbour/agents'],
    ['a file rather than a directory', 'package.json'],
  ])('exits 2 on %s in strict mode', async (_label, override) => {
    makePkg('@fixture/strict', { name: '@fixture/strict', version: '1.0.0' });
    makePkg(
      '@fixture/neighbour',
      { name: '@fixture/neighbour', version: '1.0.0' },
      'agents',
    );

    await expect(
      resolvePackage('@fixture/strict', { assetPathOverride: override }, root),
    ).rejects.toThrow('process.exit(2)');
  });

  it('returns null instead of exiting when the batch may continue', async () => {
    makePkg('@fixture/batch', { name: '@fixture/batch', version: '1.0.0' });

    const meta = await resolvePackage(
      '@fixture/batch',
      { assetPathOverride: 'nowhere', skipMissingAsset: true },
      root,
    );

    expect(meta).toBeNull();
    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining('--asset-path'),
    );
  });
});

describe('toConsumerPackages', () => {
  it('turns a flag-sourced asset path into a directory hash source', async () => {
    const packageRoot = makePkg(
      '@fixture/consumer',
      { name: '@fixture/consumer', version: '3.0.0' },
      'agents',
    );
    // The manifest is present on purpose: `hashesPresent` staying false is
    // only evidence of "never probed" when probing would have found one.
    mkdirSync(join(packageRoot, 'dist'), { recursive: true });
    writeFileSync(join(packageRoot, 'dist', 'agents-hashes.json'), '{}');

    const [target] = await toConsumerPackages([
      {
        packageRoot,
        packageName: '@fixture/consumer',
        packageVersion: '3.0.0',
        assetPath: 'agents',
        assetPathSource: 'flag',
      },
    ]);

    expect(target!.hashSource).toBe('directory');
    expect(target!.assetRoot).toBe(join(packageRoot, 'agents'));
    expect(target!.assetPath).toBe('agents');
    expect(target!.hashesPresent).toBe(false);
  });

  it('keeps a declared asset path on the manifest source', async () => {
    const packageRoot = makePkg('@fixture/declared-consumer', {
      name: '@fixture/declared-consumer',
      version: '3.0.0',
      agents: { assetPath: 'docs/agents' },
    });

    const [target] = await toConsumerPackages([
      {
        packageRoot,
        packageName: '@fixture/declared-consumer',
        packageVersion: '3.0.0',
        assetPath: 'docs/agents',
        assetPathSource: 'package',
      },
    ]);

    expect(target!.hashSource).toBe('manifest');
    expect(target!.hashesPresent).toBe(false);
  });
});
