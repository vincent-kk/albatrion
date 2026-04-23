import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { program } from '../../src/program.js';

describe('legacy program() factory — behavior parity after ink removal', () => {
  let tmp: string;
  let packageRoot: string;
  let assetRoot: string;
  let projectRoot: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-legacy-'));
    packageRoot = join(tmp, 'pkg');
    assetRoot = join(packageRoot, 'docs', 'claude');
    projectRoot = join(tmp, 'consumer-project');
    await mkdir(assetRoot, { recursive: true });
    await mkdir(projectRoot, { recursive: true });

    const file = join(assetRoot, 'skills', 'x', 'SKILL.md');
    await mkdir(join(assetRoot, 'skills', 'x'), { recursive: true });
    await writeFile(file, 'content\n', 'utf-8');

    await mkdir(join(packageRoot, 'dist'), { recursive: true });
    await writeFile(
      join(packageRoot, 'dist', 'claude-hashes.json'),
      JSON.stringify({
        schemaVersion: 1,
        package: { name: '@test/legacy', version: '1.2.3' },
        generatedAt: new Date().toISOString(),
        algorithm: 'sha256',
        assetRoot: 'docs/claude',
        files: {
          // sha256 of "content\n"
          'skills/x/SKILL.md': 'b4875ea9f6fa38b98f34c89bcc3d2c6fc7eeec45b8b6a8ab44aa1cbae2dbf9b9',
        },
        previousVersions: {},
      }),
      'utf-8',
    );
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('accepts the same ProgramOptions shape as v0.2 and runs --dry-run without errors', async () => {
    const originalCwd = process.cwd();
    process.chdir(projectRoot);
    try {
      // No assertion on UX — parity means the factory signature still accepts
      // the documented input and drives a successful run under explicit flags
      // (no prompts needed when --scope + --dry-run are provided).
      await expect(
        program({
          packageName: '@test/legacy',
          packageVersion: '1.2.3',
          packageRoot,
          argv: ['node', 'inject-docs', 'inject-docs', '--scope=project', '--dry-run'],
        }),
      ).resolves.toBeUndefined();
    } finally {
      process.chdir(originalCwd);
    }
  });
});
