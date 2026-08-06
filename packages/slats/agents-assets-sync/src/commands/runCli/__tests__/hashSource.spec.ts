// filid:contract AC-RUNCLI-HASH-SOURCE
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { ResolvedMetadata } from '../targets/resolvePackage.js';
import { toConsumerPackages } from '../targets/toConsumerPackages.js';

let root: string;

/** Install a fixture package, optionally with an asset root and a built manifest. */
function makePkg(
  name: string,
  options: { assetDir?: string; withManifest?: boolean } = {},
): string {
  const dir = join(root, 'node_modules', ...name.split('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name }));
  if (options.assetDir)
    mkdirSync(join(dir, options.assetDir), { recursive: true });
  if (options.withManifest) {
    mkdirSync(join(dir, 'dist'), { recursive: true });
    writeFileSync(join(dir, 'dist', 'agents-hashes.json'), '{}');
  }
  return realpathSync(dir);
}

function metadata(
  packageRoot: string,
  assetPath: string,
  assetPathSource: ResolvedMetadata['assetPathSource'],
): ResolvedMetadata {
  return {
    packageRoot,
    packageName: '@fixture/consumer',
    packageVersion: '1.0.0',
    assetPath,
    assetPathSource,
  };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'hash-source-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('hash source resolution', () => {
  // The manifest is present on purpose: the flag ignoring it is the contract,
  // and `hashesPresent` staying false is only evidence of "never probed" when
  // probing would have found one.
  it('lets --asset-path win over a manifest that is right there', async () => {
    const packageRoot = makePkg('@fixture/flagged', {
      assetDir: 'agents',
      withManifest: true,
    });

    const [target] = await toConsumerPackages([
      metadata(packageRoot, 'agents', 'flag'),
    ]);

    expect(target!.hashSource).toBe('directory');
    expect(target!.hashesPresent).toBe(false);
    expect(target!.assetRoot).toBe(join(packageRoot, 'agents'));
  });

  it('reads the manifest when the declaring package has built one', async () => {
    const packageRoot = makePkg('@fixture/built', {
      assetDir: 'docs/agents',
      withManifest: true,
    });

    const [target] = await toConsumerPackages([
      metadata(packageRoot, 'docs/agents', 'package'),
    ]);

    expect(target!.hashSource).toBe('manifest');
    expect(target!.hashesPresent).toBe(true);
  });

  // A declaration says where the assets are, not that a build ran. The
  // directory is there to be hashed, so the run proceeds instead of demanding
  // build output it does not need.
  it('hashes the declared directory when no manifest was built', async () => {
    const packageRoot = makePkg('@fixture/unbuilt', {
      assetDir: 'docs/agents',
    });

    const [target] = await toConsumerPackages([
      metadata(packageRoot, 'docs/agents', 'package'),
    ]);

    expect(target!.hashSource).toBe('directory');
    expect(target!.hashesPresent).toBe(false);
    expect(target!.assetRoot).toBe(join(packageRoot, 'docs', 'agents'));
  });

  // Neither source can answer, and hashing a missing directory would answer
  // "nothing is shipped" — which makes every installed file an orphan, and
  // `--force` deletes orphans. The gate is the correct outcome here.
  it('stays on the manifest source when the directory is absent too', async () => {
    const packageRoot = makePkg('@fixture/pruned');

    const [target] = await toConsumerPackages([
      metadata(packageRoot, 'docs/agents', 'package'),
    ]);

    expect(target!.hashSource).toBe('manifest');
    expect(target!.hashesPresent).toBe(false);
  });
});
