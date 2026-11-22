import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { OrphanScan } from '../../agentTarget/index.js';
import { buildPlan } from '../buildPlan.js';

let root: string;
let scan: OrphanScan;

function writeAt(rel: string, body: string): void {
  const abs = join(root, rel);
  mkdirSync(join(abs, '..'), { recursive: true });
  writeFileSync(abs, body, 'utf-8');
}

function plan(force: boolean) {
  return buildPlan({
    sourceHashes: {},
    destinations: new Map(),
    orphanScans: [scan],
    force,
  });
}

describe('core/buildPlan — orphan policy', () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'slats-orphan-'));
    scan = { kind: 'directory', scanRoot: root, relPathPrefix: 'skills/pp/' };
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('requires force for an orphan the run would delete under --force', async () => {
    writeAt('stale.md', 'stale');
    const result = await plan(true);
    expect(result.actions.map((action) => action.kind)).toEqual(['delete']);
    expect(result.requiresForce).toBe(true);
  });

  it('ignores the noise the source hasher never ships', async () => {
    writeAt('.DS_Store', 'finder');
    writeAt('nested/.DS_Store', 'finder');
    writeAt('debug.log', 'log');
    writeAt('.omc/state.json', '{}');
    for (const force of [false, true]) {
      const result = await plan(force);
      expect(result.actions).toEqual([]);
      expect(result.requiresForce).toBe(false);
    }
  });
});
