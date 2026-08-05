// filid:contract AC-MANIFEST-COMPUTE
import { mkdtempSync, rmSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildHashes } from '../../../../scripts/buildHashes.mjs';
import { resolveHashManifest } from '../hashManifest.js';
import type { HashManifest, HashManifestSource } from '../type.js';

const ASSET_PATH = 'docs/agents';
const GENERATED_AT = '2026-08-06T00:00:00.000Z';

let packageRoot: string;
let assetRoot: string;

/** The target `--asset-path` produces: hash the directory, ignore `dist/`. */
function directorySource(): HashManifestSource {
  return {
    name: '@fixture/no-declaration',
    version: '1.2.3',
    packageRoot,
    assetRoot,
    assetPath: ASSET_PATH,
    hashSource: 'directory',
  };
}

async function writeAsset(relPath: string, body: string): Promise<void> {
  const abs = join(assetRoot, relPath);
  await mkdir(resolve(abs, '..'), { recursive: true });
  await writeFile(abs, body, 'utf-8');
}

beforeEach(async () => {
  packageRoot = mkdtempSync(join(tmpdir(), 'slats-manifest-'));
  assetRoot = join(packageRoot, ASSET_PATH);
  await writeAsset('skills/alpha/SKILL.md', '# Alpha\n');
  await writeAsset('rules/beta.md', '# Beta\n');
  await writeAsset('nested/deep/gamma.md', '# Gamma\n');
  await writeAsset('.DS_Store', 'noise');
  await writeAsset('debug.log', 'noise');
  await writeAsset('.omc/state.json', '{}');
});

afterEach(() => {
  rmSync(packageRoot, { recursive: true, force: true });
});

// The build-time script must stay pure Node ESM, so its walk and noise list
// cannot be shared with `utils/computeHashManifest.ts`. These cases are what
// keeps the two copies honest.
describe('computed vs built manifest', () => {
  async function built(): Promise<HashManifest> {
    await buildHashes({
      packageRoot,
      packageName: '@fixture/no-declaration',
      packageVersion: '1.2.3',
      assetPath: ASSET_PATH,
    });
    const raw = await readFile(
      join(packageRoot, 'dist', 'agents-hashes.json'),
      'utf-8',
    );
    return JSON.parse(raw) as HashManifest;
  }

  it('hashes the directory into the same files map the build writes', async () => {
    const computed = await resolveHashManifest(directorySource(), GENERATED_AT);
    expect(computed.files).toEqual((await built()).files);
  });

  it('drops the same noise from both paths', async () => {
    const computed = await resolveHashManifest(directorySource(), GENERATED_AT);
    const noise = ['.DS_Store', 'debug.log', '.omc/state.json'];
    expect(Object.keys(computed.files)).toEqual(
      expect.not.arrayContaining(noise),
    );
    expect(Object.keys((await built()).files)).toEqual(
      expect.not.arrayContaining(noise),
    );
  });
});

describe('computed manifest shape', () => {
  it('keys nested paths with forward slashes, sorted', async () => {
    const manifest = await resolveHashManifest(directorySource(), GENERATED_AT);
    expect(Object.keys(manifest.files)).toEqual([
      'nested/deep/gamma.md',
      'rules/beta.md',
      'skills/alpha/SKILL.md',
    ]);
  });

  it('records the asset root as a package-relative path', async () => {
    const manifest = await resolveHashManifest(directorySource(), GENERATED_AT);
    expect(manifest.assetRoot).toBe(ASSET_PATH);
    expect(manifest.generatedAt).toBe(GENERATED_AT);
    expect(manifest.package).toEqual({
      name: '@fixture/no-declaration',
      version: '1.2.3',
    });
  });

  it('yields an empty files map when the asset root is absent', async () => {
    const manifest = await resolveHashManifest(
      { ...directorySource(), assetRoot: join(packageRoot, 'nowhere') },
      GENERATED_AT,
    );
    expect(manifest.files).toEqual({});
  });
});

describe('source selection', () => {
  it('succeeds without dist/agents-hashes.json when hashing the directory', async () => {
    const manifest = await resolveHashManifest(directorySource(), GENERATED_AT);
    expect(Object.keys(manifest.files)).toHaveLength(3);
  });

  it('reads dist/agents-hashes.json when the source is the manifest', async () => {
    await buildHashes({
      packageRoot,
      packageName: '@fixture/no-declaration',
      packageVersion: '1.2.3',
      assetPath: ASSET_PATH,
    });
    const manifest = await resolveHashManifest(
      { ...directorySource(), hashSource: 'manifest' },
      GENERATED_AT,
    );
    expect(manifest.generatedAt).not.toBe(GENERATED_AT);
    expect(Object.keys(manifest.files)).toHaveLength(3);
  });

  it('fails when the source is the manifest and the file is absent', async () => {
    await expect(
      resolveHashManifest(
        { ...directorySource(), hashSource: 'manifest' },
        GENERATED_AT,
      ),
    ).rejects.toThrow();
  });
});
