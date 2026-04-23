import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { discover } from '../../src/discover/index.js';
import { injectDocs } from '../../src/core/injectDocs/index.js';

describe('discover + inject integration (fixture monorepo)', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-integration-'));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('discovers two consumer packages in a workspace and injects both (dry-run)', async () => {
    await writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({
        name: '@fixture/root',
        version: '0.0.0',
        workspaces: ['packages/*'],
        private: true,
      }),
      'utf-8',
    );
    await mkdir(join(tmp, 'packages'), { recursive: true });

    const pkgA = await writeConsumer(tmp, 'a', '@fixture/a', '1.0.0', {
      'skills/alpha/SKILL.md': 'alpha content',
    });
    const pkgB = await writeConsumer(tmp, 'b', '@fixture/b', '2.0.0', {
      'skills/beta/SKILL.md': 'beta content',
    });

    const projectRoot = join(tmp, 'consumer-project');
    await mkdir(projectRoot, { recursive: true });

    // Discovery must pick up both fixtures from the workspace root walk.
    const consumers = await discover({ cwd: tmp });
    expect(consumers.map((c) => c.name).sort()).toEqual([
      '@fixture/a',
      '@fixture/b',
    ]);
    expect(consumers.every((c) => c.hashesPresent)).toBe(true);

    // Dry-run inject both.
    for (const consumer of consumers) {
      const report = await injectDocs({
        packageName: consumer.name,
        packageVersion: consumer.version,
        packageRoot: consumer.packageRoot,
        assetRoot: consumer.assetRoot,
        scope: 'project',
        dryRun: true,
        force: false,
      });
      expect(report.exitCode).toBe(0);
    }

    // Silence unused var warnings for the returned roots.
    expect(pkgA).toBeTruthy();
    expect(pkgB).toBeTruthy();
  });
});

async function writeConsumer(
  root: string,
  dirName: string,
  pkgName: string,
  pkgVersion: string,
  files: Record<string, string>,
): Promise<string> {
  const packageRoot = join(root, 'packages', dirName);
  const assetRoot = join(packageRoot, 'docs', 'claude');
  const hashes: Record<string, string> = {};

  for (const [relPath, content] of Object.entries(files)) {
    const abs = join(assetRoot, relPath);
    await mkdir(join(abs, '..'), { recursive: true });
    await writeFile(abs, content, 'utf-8');
    hashes[relPath] = createHash('sha256').update(content, 'utf-8').digest('hex');
  }

  await writeFile(
    join(packageRoot, 'package.json'),
    JSON.stringify(
      {
        name: pkgName,
        version: pkgVersion,
        claude: { assetPath: 'docs/claude' },
      },
      null,
      2,
    ),
    'utf-8',
  );

  await mkdir(join(packageRoot, 'dist'), { recursive: true });
  await writeFile(
    join(packageRoot, 'dist', 'claude-hashes.json'),
    JSON.stringify({
      schemaVersion: 1,
      package: { name: pkgName, version: pkgVersion },
      generatedAt: new Date().toISOString(),
      algorithm: 'sha256',
      assetRoot: 'docs/claude',
      files: hashes,
      previousVersions: {},
    }),
    'utf-8',
  );

  return packageRoot;
}
