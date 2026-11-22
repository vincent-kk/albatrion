// r3-agents-assets-sync: a run that fails midway through writing.
// The child runs the public runCli under RLIMIT_FSIZE, so write() stops at a
// byte offset with EFBIG — the same shape as a full disk (ENOSPC) or a crash in
// the middle of the write. core/DETAIL.md:14 and README.md:60 promise that the
// content outside this tool's blocks in AGENTS.md is preserved byte for byte.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import {
  PACKAGE_ROOT,
  RUNNER,
  TSX_LOADER,
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

// 16 blocks of 512 bytes: write() fails past 8 KiB.
const LIMIT_BLOCKS = 16;

function runChildWithFileSizeLimit(
  blocks: number,
  args: readonly string[],
): { status: number | null; signal: NodeJS.Signals | null; stderr: string } {
  const result = spawnSync(
    '/bin/sh',
    [
      '-c',
      `ulimit -f ${blocks} && exec "$@"`,
      'sh',
      process.execPath,
      '--import',
      pathToFileURL(TSX_LOADER).href,
      RUNNER,
      ...args,
    ],
    {
      cwd: PACKAGE_ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        TSX_DISABLE_CACHE: '1',
        TSX_TSCONFIG_PATH: join(PACKAGE_ROOT, 'tsconfig.json'),
      },
      timeout: 60_000,
    },
  );
  return {
    status: result.status,
    signal: result.signal,
    stderr: result.stderr,
  };
}

function prose(bytes: number): string {
  let text = '# Team conventions (hand-written)\n\n';
  for (let line = 1; text.length < bytes; line += 1)
    text += `- convention ${line}: keep this line, it is the team's own note\n`;
  return text;
}

describe('r3-agents-assets-sync: a write that fails midway', () => {
  it('a failed AGENTS.md rewrite leaves the hand-written prose outside the blocks intact', () => {
    const root = makeRoot('efbig-md');
    roots.push(root);
    installPackage(root, {
      name: '@probe/rules',
      assets: { 'rules/r.md': 'rule body\n' },
    });
    const original = prose(32 * 1024);
    writeAt(join(root, 'AGENTS.md'), original);

    const run = runChildWithFileSizeLimit(LIMIT_BLOCKS, [
      '--package=@probe/rules',
      '--agent=codex',
      '--scope=project',
      `--root=${root}`,
      '--no-interactive',
    ]);
    const after = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    expect({
      status: run.status,
      startsWithOriginal: after.startsWith(original),
      sizeAfter: after.length,
      sizeBefore: original.length,
    }).toEqual({
      status: 1,
      startsWithOriginal: true,
      sizeAfter: expect.any(Number),
      sizeBefore: original.length,
    });
  });

  it('a skill copy that fails midway does not block the next run as a diverged user edit', async () => {
    const root = makeRoot('efbig-skill');
    roots.push(root);
    const big = `# skill\n${'x'.repeat(32 * 1024)}\n`;
    installPackage(root, {
      name: '@probe/skill',
      assets: { 'skills/s/SKILL.md': big },
    });
    const args = [
      '--package=@probe/skill',
      '--agent=claude',
      '--scope=project',
      `--root=${root}`,
      '--no-interactive',
    ];
    const failed = runChildWithFileSizeLimit(LIMIT_BLOCKS, args);
    const dst = join(root, '.claude/skills/s/SKILL.md');
    const leftover = existsSync(dst) ? statSync(dst).size : null;
    const rerun = await runCliCode(args);
    expect({ failedStatus: failed.status, leftover, rerun }).toEqual({
      failedStatus: 1,
      leftover: null,
      rerun: 0,
    });
  });
});
