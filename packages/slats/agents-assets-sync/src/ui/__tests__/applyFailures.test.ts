import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import type { Action } from '../../core/index.js';
import { applyAllPlans } from '../hooks/useApplyStep.js';

it.each(['file', 'block'] as const)('reports %s failures without claiming creation', async (kind) => {
  const root = mkdtempSync(join(tmpdir(), 'apply-failures-'));
  try {
    writeFileSync(join(root, 'good.md'), 'good');
    const good: Action = { kind: 'copy', relPath: 'good.md', target: { kind: 'file', dstAbs: join(root, 'out/good.md') } };
    const bad: Action = { kind: 'copy', relPath: 'missing.md', target: kind === 'file' ? { kind: 'file', dstAbs: join(root, 'out/missing.md') } : { kind: 'block', fileAbs: join(root, 'AGENTS.md'), blockId: 'pkg:rules/missing.md' } };
    const result = await applyAllPlans({ plans: [{ target: { name: 'pkg', version: '1', packageRoot: root, assetRoot: root, assetPath: '.', hashesPresent: false, hashSource: 'directory' }, agentTarget: { agent: 'claude', scope: 'project', projectRoot: root, description: 'test', directoryRoots: { skills: root, rules: root, commands: root }, rulesMergeFile: null, unsupported: {} }, plan: { actions: [good, bad], requiresForce: false } }], dryRun: false, force: false, dispatch: () => {} });
    expect(result.exitCode).toBe(1);
    expect(result.reports[0].created).toEqual(['good.md']);
    expect(result.reports[0].warnings).toContainEqual({ relPath: 'missing.md', reason: 'failed' });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
