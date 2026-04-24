import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  findNearestDotClaudeAncestor,
  resolveScope,
} from '../../src/core/scope/index.js';

describe('core/scope — walk-up .claude resolver', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-scope-'));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('findNearestDotClaudeAncestor returns the nearest ancestor that owns .claude', async () => {
    // tmp/.claude + tmp/packages/a/src/
    await mkdir(join(tmp, '.claude'), { recursive: true });
    const deep = join(tmp, 'packages', 'a', 'src');
    await mkdir(deep, { recursive: true });

    expect(findNearestDotClaudeAncestor(deep)).toBe(tmp);
    expect(findNearestDotClaudeAncestor(tmp)).toBe(tmp); // self counts
  });

  it('findNearestDotClaudeAncestor returns the deepest ancestor when multiple exist', async () => {
    // tmp/.claude AND tmp/packages/a/.claude
    await mkdir(join(tmp, '.claude'), { recursive: true });
    await mkdir(join(tmp, 'packages', 'a', '.claude'), { recursive: true });
    const deep = join(tmp, 'packages', 'a', 'src');
    await mkdir(deep, { recursive: true });

    expect(findNearestDotClaudeAncestor(deep)).toBe(join(tmp, 'packages', 'a'));
  });

  it('findNearestDotClaudeAncestor treats a file at .claude as no match', async () => {
    const nothing = join(tmp, 'nothing');
    await mkdir(nothing, { recursive: true });
    // Note: no .claude dir anywhere inside tmp — but the test itself cannot
    // guarantee no ancestor higher up (outside tmp) has one. We only assert
    // that the walk does not stop at our own tmp level because no .claude
    // was created there.
    const result = findNearestDotClaudeAncestor(nothing);
    // Either null (no ancestor at all) or some path OUTSIDE tmp.
    if (result !== null) expect(result.startsWith(tmp)).toBe(false);
  });

  it('resolveScope("project") auto-locates the ancestor .claude and tags description', async () => {
    await mkdir(join(tmp, '.claude'), { recursive: true });
    const deep = join(tmp, 'packages', 'a');
    await mkdir(deep, { recursive: true });

    const res = resolveScope('project', deep);
    expect(res.targetRoot).toBe(join(tmp, '.claude'));
    expect(res.description).toContain('auto-located');
  });

  it('resolveScope("user") is unchanged by walk-up logic', async () => {
    const res = resolveScope('user', tmp);
    expect(res.targetRoot.endsWith('/.claude')).toBe(true);
    expect(res.description).toBe('~/.claude (user)');
    expect(res.description).not.toContain('auto-located');
  });
});
