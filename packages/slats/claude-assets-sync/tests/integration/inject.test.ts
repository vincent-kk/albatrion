import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { injectDocs } from '../../src/core/injectDocs/index.js';

describe('injectDocs (single caller-owned consumer)', () => {
  let tmp: string;
  let packageRoot: string;
  let assetRoot: string;
  let projectRoot: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-inject-'));
    packageRoot = join(tmp, 'pkg');
    assetRoot = join(packageRoot, 'docs', 'claude');
    projectRoot = join(tmp, 'consumer-project');
    await mkdir(assetRoot, { recursive: true });
    await mkdir(projectRoot, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('dry-run succeeds when caller supplies matching asset tree + hash manifest', async () => {
    const relPath = 'skills/alpha/SKILL.md';
    const content = 'alpha\n';
    await mkdir(join(assetRoot, 'skills', 'alpha'), { recursive: true });
    await writeFile(join(assetRoot, relPath), content, 'utf-8');

    await mkdir(join(packageRoot, 'dist'), { recursive: true });
    await writeFile(
      join(packageRoot, 'dist', 'claude-hashes.json'),
      JSON.stringify({
        schemaVersion: 1,
        package: { name: '@fixture/alpha', version: '1.0.0' },
        generatedAt: new Date().toISOString(),
        algorithm: 'sha256',
        assetRoot: 'docs/claude',
        files: {
          [relPath]: createHash('sha256').update(content, 'utf-8').digest('hex'),
        },
        previousVersions: {},
      }),
      'utf-8',
    );

    const originalCwd = process.cwd();
    process.chdir(projectRoot);
    try {
      const report = await injectDocs({
        packageName: '@fixture/alpha',
        packageVersion: '1.0.0',
        packageRoot,
        assetRoot,
        scope: 'project',
        dryRun: true,
        force: false,
      });
      expect(report.exitCode).toBe(0);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('honors assetPath pointing at a non-default directory', async () => {
    const customAssetRoot = join(packageRoot, 'claude');
    await mkdir(join(customAssetRoot, 'skills', 'beta'), { recursive: true });
    const content = 'beta\n';
    await writeFile(
      join(customAssetRoot, 'skills', 'beta', 'SKILL.md'),
      content,
      'utf-8',
    );

    await mkdir(join(packageRoot, 'dist'), { recursive: true });
    await writeFile(
      join(packageRoot, 'dist', 'claude-hashes.json'),
      JSON.stringify({
        schemaVersion: 1,
        package: { name: '@fixture/beta', version: '1.0.0' },
        generatedAt: new Date().toISOString(),
        algorithm: 'sha256',
        assetRoot: 'claude',
        files: {
          'skills/beta/SKILL.md': createHash('sha256')
            .update(content, 'utf-8')
            .digest('hex'),
        },
        previousVersions: {},
      }),
      'utf-8',
    );

    const originalCwd = process.cwd();
    process.chdir(projectRoot);
    try {
      const report = await injectDocs({
        packageName: '@fixture/beta',
        packageVersion: '1.0.0',
        packageRoot,
        assetRoot: customAssetRoot,
        scope: 'project',
        dryRun: true,
        force: false,
      });
      expect(report.exitCode).toBe(0);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
