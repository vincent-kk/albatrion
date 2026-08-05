import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type {
  Destination,
  OrphanScan,
} from '../../src/core/agentTarget/index.js';
import { buildPlan } from '../../src/core/buildPlan/index.js';
import { hashContent } from '../../src/core/hash/index.js';
import {
  formatBlockId,
  upsertBlock,
} from '../../src/core/markerBlock/index.js';

const PKG = '@canard/schema-form';
const RULE = 'rules/form-rule.md';
const RULE_BODY = '# Form Rule\n\nValidate at the boundary.\n';
const RULE_ID = formatBlockId(PKG, RULE);

describe('core/buildPlan — block destinations', () => {
  let tmp: string;
  let agentsMd: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-plan-'));
    agentsMd = join(tmp, 'AGENTS.md');
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  function blockPlan(force: boolean, scans: readonly OrphanScan[] = []) {
    const destinations = new Map<string, Destination>([
      [RULE, { kind: 'block', fileAbs: agentsMd, blockId: RULE_ID }],
    ]);
    return buildPlan({
      sourceHashes: { [RULE]: hashContent(RULE_BODY) },
      destinations,
      orphanScans: scans,
      force,
    });
  }

  it('plans a copy when the document does not exist yet', async () => {
    const plan = await blockPlan(false);
    expect(plan.actions).toEqual([
      {
        kind: 'copy',
        relPath: RULE,
        target: { kind: 'block', fileAbs: agentsMd, blockId: RULE_ID },
      },
    ]);
    expect(plan.requiresForce).toBe(false);
  });

  it('plans a copy when the document exists without this block', async () => {
    await writeFile(
      agentsMd,
      '<!-- FILID:START:x.md -->\n# X\n<!-- FILID:END:x.md -->\n',
      'utf-8',
    );
    const plan = await blockPlan(false);
    expect(plan.actions[0]?.kind).toBe('copy');
  });

  it('skips when the block body still matches the manifest', async () => {
    await writeFile(agentsMd, upsertBlock('', RULE_ID, RULE_BODY), 'utf-8');
    const plan = await blockPlan(false);
    expect(plan.actions[0]?.kind).toBe('skip-uptodate');
    expect(plan.requiresForce).toBe(false);
  });

  it('flags a locally edited block as diverged and demands force', async () => {
    await writeFile(
      agentsMd,
      upsertBlock('', RULE_ID, '# Edited by hand\n'),
      'utf-8',
    );
    const plan = await blockPlan(false);
    expect(plan.actions[0]?.kind).toBe('warn-diverged');
    expect(plan.requiresForce).toBe(true);
  });

  it('warns about a block this package no longer ships', async () => {
    const staleId = formatBlockId(PKG, 'rules/removed.md');
    let doc = upsertBlock('', RULE_ID, RULE_BODY);
    doc = upsertBlock(doc, staleId, '# Removed\n');
    await writeFile(agentsMd, doc, 'utf-8');

    const plan = await blockPlan(false, [
      { kind: 'block-file', fileAbs: agentsMd, ownerPackage: PKG },
    ]);
    expect(plan.actions).toContainEqual({
      kind: 'warn-orphan',
      relPath: 'rules/removed.md',
      target: { kind: 'block', fileAbs: agentsMd, blockId: staleId },
    });
    expect(plan.requiresForce).toBe(true);
  });

  it('turns a stale block into a delete under --force', async () => {
    const staleId = formatBlockId(PKG, 'rules/removed.md');
    await writeFile(
      agentsMd,
      upsertBlock(upsertBlock('', RULE_ID, RULE_BODY), staleId, '# Removed\n'),
      'utf-8',
    );
    const plan = await blockPlan(true, [
      { kind: 'block-file', fileAbs: agentsMd, ownerPackage: PKG },
    ]);
    expect(plan.actions.some((a) => a.kind === 'delete')).toBe(true);
  });

  it("leaves another package's block alone", async () => {
    const foreignId = formatBlockId('@winglet/json', 'rules/json.md');
    await writeFile(
      agentsMd,
      upsertBlock(upsertBlock('', RULE_ID, RULE_BODY), foreignId, '# JSON\n'),
      'utf-8',
    );
    const plan = await blockPlan(true, [
      { kind: 'block-file', fileAbs: agentsMd, ownerPackage: PKG },
    ]);
    expect(plan.actions.every((a) => a.kind !== 'delete')).toBe(true);
    // The document is only read here; nothing was rewritten.
    expect(await readFile(agentsMd, 'utf-8')).toContain(foreignId);
  });

  it('reports an unsupported kind without demanding force', async () => {
    const plan = await buildPlan({
      sourceHashes: { 'commands/gen.md': hashContent('x') },
      destinations: new Map<string, Destination>([
        ['commands/gen.md', { kind: 'unsupported', reason: 'codex has none' }],
      ]),
      orphanScans: [],
      force: false,
    });
    expect(plan.actions).toEqual([
      {
        kind: 'skip-unsupported',
        relPath: 'commands/gen.md',
        target: { kind: 'unsupported', reason: 'codex has none' },
      },
    ]);
    expect(plan.requiresForce).toBe(false);
  });

  it('omits a path that has no destination', async () => {
    const plan = await buildPlan({
      sourceHashes: { 'README.md': hashContent('x') },
      destinations: new Map(),
      orphanScans: [],
      force: false,
    });
    expect(plan.actions).toEqual([]);
  });
});

describe('core/buildPlan — file destinations', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-plan-file-'));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('copies, skips and diverges per file, and finds directory orphans', async () => {
    const skillsRoot = join(tmp, 'skills', 'form');
    await mkdir(skillsRoot, { recursive: true });
    await writeFile(join(skillsRoot, 'same.md'), 'same\n', 'utf-8');
    await writeFile(join(skillsRoot, 'edited.md'), 'local edit\n', 'utf-8');
    await writeFile(join(skillsRoot, 'stale.md'), 'stale\n', 'utf-8');

    const plan = await buildPlan({
      sourceHashes: {
        'skills/form/same.md': hashContent('same\n'),
        'skills/form/edited.md': hashContent('upstream\n'),
        'skills/form/new.md': hashContent('new\n'),
      },
      destinations: new Map<string, Destination>([
        [
          'skills/form/same.md',
          { kind: 'file', dstAbs: join(skillsRoot, 'same.md') },
        ],
        [
          'skills/form/edited.md',
          { kind: 'file', dstAbs: join(skillsRoot, 'edited.md') },
        ],
        [
          'skills/form/new.md',
          { kind: 'file', dstAbs: join(skillsRoot, 'new.md') },
        ],
      ]),
      orphanScans: [
        {
          kind: 'directory',
          scanRoot: skillsRoot,
          relPathPrefix: 'skills/form/',
        },
      ],
      force: false,
    });

    const byPath = new Map(plan.actions.map((a) => [a.relPath, a.kind]));
    expect(byPath.get('skills/form/same.md')).toBe('skip-uptodate');
    expect(byPath.get('skills/form/edited.md')).toBe('warn-diverged');
    expect(byPath.get('skills/form/new.md')).toBe('copy');
    expect(byPath.get('skills/form/stale.md')).toBe('warn-orphan');
    expect(plan.requiresForce).toBe(true);
  });

  it('scans a missing orphan root without failing', async () => {
    const plan = await buildPlan({
      sourceHashes: {},
      destinations: new Map(),
      orphanScans: [
        {
          kind: 'directory',
          scanRoot: join(tmp, 'absent'),
          relPathPrefix: 'skills/absent/',
        },
        {
          kind: 'block-file',
          fileAbs: join(tmp, 'absent.md'),
          ownerPackage: PKG,
        },
      ],
      force: false,
    });
    expect(plan.actions).toEqual([]);
  });
});
