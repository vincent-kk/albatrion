import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { injectDocs } from '../../src/core/injectDocs/index.js';

async function writeManifest(packageRoot: string, files: Record<string, string>): Promise<void> {
  await mkdir(join(packageRoot, 'dist'), { recursive: true });
  await writeFile(
    join(packageRoot, 'dist', 'claude-hashes.json'),
    JSON.stringify({
      schemaVersion: 1,
      package: { name: '@test/fixture', version: '0.0.0' },
      generatedAt: new Date().toISOString(),
      algorithm: 'sha256',
      assetRoot: 'docs/claude',
      files,
      previousVersions: {},
    }),
    'utf-8',
  );
}

describe('non-TTY path (headless injection without prompts)', () => {
  let tmp: string;
  let packageRoot: string;
  let assetRoot: string;
  let projectRoot: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-nontty-'));
    packageRoot = join(tmp, 'pkg');
    assetRoot = join(packageRoot, 'docs', 'claude');
    projectRoot = join(tmp, 'consumer-project');
    await mkdir(assetRoot, { recursive: true });
    await mkdir(projectRoot, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('copies files in project scope without any prompt callback', async () => {
    const assetFile = join(assetRoot, 'skills', 'a', 'SKILL.md');
    await mkdir(join(assetRoot, 'skills', 'a'), { recursive: true });
    await writeFile(assetFile, 'hello\n', 'utf-8');
    // sha256 of "hello\n" = 5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03
    await writeManifest(packageRoot, {
      'skills/a/SKILL.md': '5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03',
    });

    const originalCwd = process.cwd();
    process.chdir(projectRoot);
    try {
      const report = await injectDocs({
        packageName: '@test/fixture',
        packageVersion: '0.0.0',
        packageRoot,
        assetRoot,
        scope: 'project',
        dryRun: false,
        force: false,
      });
      expect(report.exitCode).toBe(0);
      expect(report.created.length).toBe(1);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('dry-run emits plan and exits 0 without copying', async () => {
    const assetFile = join(assetRoot, 'skills', 'a', 'SKILL.md');
    await mkdir(join(assetRoot, 'skills', 'a'), { recursive: true });
    await writeFile(assetFile, 'hi\n', 'utf-8');
    await writeManifest(packageRoot, {
      'skills/a/SKILL.md': '1b22a01dce50ead4fef0297d20c5ba8a4b04baadd25a63f9dba65eb77b4f7a4e',
    });

    const originalCwd = process.cwd();
    process.chdir(projectRoot);
    try {
      const report = await injectDocs({
        packageName: '@test/fixture',
        packageVersion: '0.0.0',
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
});
