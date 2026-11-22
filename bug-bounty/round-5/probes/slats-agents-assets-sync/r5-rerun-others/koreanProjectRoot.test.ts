// RG2 follow-up: round-3 agents-assets-sync 14 (142eae648, db02fdf39) moved README.md to the
// root-marker rule; this checks the Korean "Agent destinations" sentence against the code.
// Files are written only under os.tmpdir().
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { resolveProjectRoot } from '../../index.js';

const packageRoot = resolve(__dirname, '../../..');
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

/** The README line that defines `projectRoot` under "Agent destinations". */
const projectRootLine = (name: string) =>
  readFileSync(resolve(packageRoot, name), 'utf8')
    .split('\n')
    .find((line) => line.startsWith('`projectRoot`'));

describe('README-ko_kr.md Agent destinations sentence', () => {
  it('control: a root marker outranks a nearer .claude, as README.md:40 states', () => {
    const root = mkdtempSync(join(tmpdir(), 'r5-rerun-others-root-'));
    roots.push(root);
    writeFileSync(join(root, 'package-lock.json'), '{}');
    const member = join(root, 'apps/web');
    mkdirSync(join(member, '.claude'), { recursive: true });
    expect(resolveProjectRoot('project', member).projectRoot).toBe(root);
    expect(projectRootLine('README.md')).toContain('A marker outranks a nearer agent directory');
  });

  it('the Korean sentence describes the root-marker precedence the code applies', () => {
    const korean = projectRootLine('README-ko_kr.md') ?? '';
    // Current text: "the nearest ancestor owning any of .claude, AGENTS.md, .agents, .codex, .git".
    expect(korean).toMatch(/lockfile|pnpm-workspace|root marker|우선/);
  });
});
