import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { discover } from '../src/discover.js';

async function writePackageJson(
  dir: string,
  data: Record<string, unknown>,
): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, 'package.json'),
    JSON.stringify(data, null, 2),
    'utf-8',
  );
}

async function writeHashes(dir: string): Promise<void> {
  await mkdir(join(dir, 'dist'), { recursive: true });
  await writeFile(
    join(dir, 'dist', 'claude-hashes.json'),
    JSON.stringify({
      schemaVersion: 1,
      package: { name: 'test', version: '0.0.0' },
      generatedAt: new Date().toISOString(),
      algorithm: 'sha256',
      assetRoot: 'docs/claude',
      files: {},
      previousVersions: {},
    }),
    'utf-8',
  );
}

describe('discover', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-discover-'));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('finds the current package when it has claude.assetPath', async () => {
    await writePackageJson(tmp, {
      name: '@scope/self',
      version: '1.0.0',
      claude: { assetPath: 'docs/claude' },
    });
    const found = await discover({ cwd: tmp });
    expect(found).toHaveLength(1);
    expect(found[0]?.name).toBe('@scope/self');
    expect(found[0]?.hashesPresent).toBe(false);
  });

  it('marks hashesPresent true when dist/claude-hashes.json exists', async () => {
    await writePackageJson(tmp, {
      name: '@scope/withhashes',
      version: '2.0.0',
      claude: { assetPath: 'docs/claude' },
    });
    await writeHashes(tmp);
    const found = await discover({ cwd: tmp });
    expect(found).toHaveLength(1);
    expect(found[0]?.hashesPresent).toBe(true);
  });

  it('ignores packages without claude.assetPath', async () => {
    await writePackageJson(tmp, { name: '@scope/no-claude', version: '1.0.0' });
    const found = await discover({ cwd: tmp });
    expect(found).toHaveLength(0);
  });

  it('enumerates yarn workspace packages matching globs', async () => {
    await writePackageJson(tmp, {
      name: '@root/monorepo',
      version: '0.0.0',
      workspaces: ['packages/*'],
      private: true,
    });
    const pkgA = join(tmp, 'packages', 'a');
    const pkgB = join(tmp, 'packages', 'b');
    await writePackageJson(pkgA, {
      name: '@scope/a',
      version: '1.0.0',
      claude: { assetPath: 'docs/claude' },
    });
    await writePackageJson(pkgB, {
      name: '@scope/b',
      version: '1.1.0',
      claude: { assetPath: 'docs/claude' },
    });
    // Also throw in a non-consumer to verify filtering.
    await writePackageJson(join(tmp, 'packages', 'noop'), {
      name: '@scope/noop',
      version: '0.0.0',
    });

    const found = await discover({ cwd: tmp });
    const names = found.map((p) => p.name).sort();
    expect(names).toEqual(['@scope/a', '@scope/b']);
  });

  it('scans direct (unscoped) node_modules', async () => {
    await writePackageJson(tmp, { name: '@scope/self', version: '0.0.0' });
    const dep = join(tmp, 'node_modules', 'plain-dep');
    await writePackageJson(dep, {
      name: 'plain-dep',
      version: '3.2.1',
      claude: { assetPath: 'docs/claude' },
    });
    const found = await discover({ cwd: tmp });
    expect(found.map((p) => p.name)).toContain('plain-dep');
  });

  it('scans scoped node_modules (one level under @scope)', async () => {
    await writePackageJson(tmp, { name: '@scope/self', version: '0.0.0' });
    const dep = join(tmp, 'node_modules', '@canard', 'schema-form');
    await writePackageJson(dep, {
      name: '@canard/schema-form',
      version: '0.11.0',
      claude: { assetPath: 'docs/claude' },
    });
    const found = await discover({ cwd: tmp });
    expect(found.map((p) => p.name)).toContain('@canard/schema-form');
  });

  it('dedupes by package name (first write wins — closest to cwd)', async () => {
    // Outer and inner both claim @scope/dup, but the inner (cwd/node_modules) should be added first.
    const inner = join(tmp, 'node_modules', '@scope', 'dup');
    const outerTmp = await mkdtemp(join(tmpdir(), 'slats-discover-outer-'));
    try {
      const outer = join(outerTmp, 'node_modules', '@scope', 'dup');
      await writePackageJson(tmp, { name: '@scope/self', version: '0.0.0' });
      await writePackageJson(inner, {
        name: '@scope/dup',
        version: '2.0.0',
        claude: { assetPath: 'docs/claude' },
      });
      await writePackageJson(outer, {
        name: '@scope/dup',
        version: '1.0.0',
        claude: { assetPath: 'docs/claude' },
      });
      const found = await discover({ cwd: tmp });
      const dup = found.find((p) => p.name === '@scope/dup');
      // Only appears once.
      expect(found.filter((p) => p.name === '@scope/dup')).toHaveLength(1);
      expect(dup?.version).toBe('2.0.0');
    } finally {
      await rm(outerTmp, { recursive: true, force: true });
    }
  });

  it('completes on a synthetic 100-package tree under 2s (perf smoke)', async () => {
    await writePackageJson(tmp, {
      name: '@root/perf',
      version: '0.0.0',
      workspaces: ['packages/*'],
      private: true,
    });
    for (let i = 0; i < 100; i++) {
      await writePackageJson(join(tmp, 'packages', `pkg-${i}`), {
        name: `@perf/pkg-${i}`,
        version: '1.0.0',
        claude: i % 2 === 0 ? { assetPath: 'docs/claude' } : undefined,
      });
    }
    const startedAt = Date.now();
    const found = await discover({ cwd: tmp });
    const elapsedMs = Date.now() - startedAt;
    // Only the 50 even-indexed packages should match.
    expect(found).toHaveLength(50);
    expect(elapsedMs).toBeLessThan(2000);
  });
});
