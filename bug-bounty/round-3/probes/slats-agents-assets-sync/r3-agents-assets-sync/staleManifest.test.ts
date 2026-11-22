// r3-agents-assets-sync: a built manifest older than the asset files it
// describes. The plan compares the destination with the manifest hash, but
// `applyAction` copies the live source file, so the two can disagree.
// src/DETAIL.md AC-ASSET-PATH-APPLY: a repeated run is idempotent.
// Plausibility: in this repository, 8 of the 9 packages that ship
// `dist/agents-hashes.json` currently have a manifest older than `docs/agents`.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  PACKAGE_ROOT,
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  sha256,
} from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

describe('r3-agents-assets-sync: the packaged smoke test against a workspace package', () => {
  // docs/agents/skills/agents-docs-asset-wiring/knowledge/smoke-tests.md,
  // paths 2 and 3 run literally with the built bin from a temporary directory:
  // "3 | Re-run — no-op (idempotent) | expected exit 0". `@winglet/json` is a
  // real workspace package whose local dist manifest predates its docs.
  it('path 3 (re-run) exits 0 for @winglet/json', () => {
    const dir = makeRoot('smoke');
    roots.push(dir);
    writeFileSync(join(dir, 'AGENTS.md'), '');
    const run = () =>
      spawnSync(
        process.execPath,
        [
          join(PACKAGE_ROOT, 'bin/inject-agents-settings.mjs'),
          '--no-interactive',
          '--package=@winglet/json',
          '--agent=claude',
          '--scope=project',
        ],
        { cwd: dir, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } },
      );
    const path2 = run();
    const path3 = run();
    expect({
      path2: path2.status,
      path3: path3.status,
      path3Diverged: path3.stdout
        .concat(path3.stderr)
        .split('\n')
        .filter((line) => line.includes('local differs from source')).length,
    }).toEqual({ path2: 0, path3: 0, path3Diverged: 0 });
  });
});

describe('r3-agents-assets-sync: a stale built manifest', () => {
  it.each(['claude', 'codex'] as const)(
    'a %s install from a stale manifest converges instead of reporting its own copy as a user edit',
    async (agent) => {
      const root = makeRoot(`stale-${agent}`);
      roots.push(root);
      const relPath =
        agent === 'claude' ? 'skills/s/SKILL.md' : 'rules/team-rule.md';
      installPackage(root, {
        name: '@probe/stale',
        // The docs were edited after the last `agents-build-hashes`.
        assets: { [relPath]: '# edited after the build\n' },
        manifest: { [relPath]: sha256('# content at build time\n') },
      });
      const base = [
        '--package=@probe/stale',
        `--agent=${agent}`,
        '--scope=project',
        `--root=${root}`,
        '--no-interactive',
      ];

      const first = await runCliCode(base);
      const second = await runCliCode(base);
      const forced = await runCliCode([...base, '--force', '--yes']);
      const afterForce = await runCliCode(base);
      const installed =
        agent === 'claude'
          ? readFileSync(join(root, '.claude/skills/s/SKILL.md'), 'utf8')
          : readFileSync(join(root, 'AGENTS.md'), 'utf8');

      expect({
        first,
        second,
        forced,
        afterForce,
        installedLiveSource: installed.includes('# edited after the build'),
      }).toEqual({
        first: 0,
        second: 0,
        forced: 0,
        afterForce: 0,
        installedLiveSource: true,
      });
    },
  );
});
