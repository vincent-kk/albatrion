import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Action } from '../../buildPlan/index.js';
import {
  applyAction,
  applyBlockActions,
  partitionActions,
} from '../index.js';
import {
  formatBlockId,
  upsertBlock,
} from '../../markerBlock/index.js';

const PKG = '@canard/schema-form';
const RULE = 'rules/form-rule.md';
const RULE_BODY = '# Form Rule\n\nValidate at the boundary.\n';
const RULE_ID = formatBlockId(PKG, RULE);

function blockAction(
  kind: Action['kind'],
  fileAbs: string,
  blockId: string,
  relPath: string,
): Action {
  return { kind, relPath, target: { kind: 'block', fileAbs, blockId } };
}

describe('core/injectDocs — partitionActions', () => {
  const fileTarget = { kind: 'file', dstAbs: '/tmp/a.md' } as const;
  const blockTarget = {
    kind: 'block',
    fileAbs: '/tmp/AGENTS.md',
    blockId: RULE_ID,
  } as const;

  it('routes file and block work apart, grouping blocks by document', () => {
    const other = {
      kind: 'block',
      fileAbs: '/tmp/other.md',
      blockId: RULE_ID,
    } as const;
    const { fileActions, blockGroups } = partitionActions(
      [
        { kind: 'copy', relPath: 'skills/a.md', target: fileTarget },
        { kind: 'copy', relPath: RULE, target: blockTarget },
        { kind: 'delete', relPath: 'rules/old.md', target: other },
      ],
      false,
    );
    expect(fileActions).toHaveLength(1);
    expect([...blockGroups.keys()]).toEqual([
      '/tmp/AGENTS.md',
      '/tmp/other.md',
    ]);
  });

  it('drops non-executable verdicts', () => {
    const { fileActions, blockGroups } = partitionActions(
      [
        { kind: 'skip-uptodate', relPath: 'a', target: fileTarget },
        { kind: 'warn-orphan', relPath: 'b', target: fileTarget },
        {
          kind: 'skip-unsupported',
          relPath: 'c',
          target: { kind: 'unsupported', reason: 'none' },
        },
      ],
      true,
    );
    expect(fileActions).toEqual([]);
    expect(blockGroups.size).toBe(0);
  });

  it('executes a diverged entry only once force is granted', () => {
    const diverged: Action[] = [
      { kind: 'warn-diverged', relPath: 'skills/a.md', target: fileTarget },
    ];
    expect(partitionActions(diverged, false).fileActions).toEqual([]);
    expect(partitionActions(diverged, true).fileActions).toEqual(diverged);
  });
});

describe('core/injectDocs — applyBlockActions', () => {
  let tmp: string;
  let assetRoot: string;
  let agentsMd: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-apply-'));
    assetRoot = join(tmp, 'assets');
    agentsMd = join(tmp, 'nested', 'AGENTS.md');
    await mkdir(join(assetRoot, 'rules'), { recursive: true });
    await writeFile(join(assetRoot, RULE), RULE_BODY, 'utf-8');
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('creates the document, and its parent directory, when absent', async () => {
    await applyBlockActions(
      agentsMd,
      [blockAction('copy', agentsMd, RULE_ID, RULE)],
      assetRoot,
    );
    expect(await readFile(agentsMd, 'utf-8')).toBe(
      upsertBlock('', RULE_ID, RULE_BODY),
    );
  });

  it('appends to an existing document without disturbing foreign content', async () => {
    const original =
      '<!-- FILID:START:x.md -->\n# X\n<!-- FILID:END:x.md -->\n\nNotes.\n';
    await mkdir(join(tmp, 'nested'), { recursive: true });
    await writeFile(agentsMd, original, 'utf-8');

    await applyBlockActions(
      agentsMd,
      [blockAction('copy', agentsMd, RULE_ID, RULE)],
      assetRoot,
    );
    const next = await readFile(agentsMd, 'utf-8');
    expect(next.startsWith(original)).toBe(true);
    expect(next).toContain(RULE_ID);
  });

  it('is idempotent — applying the same copy twice leaves one block', async () => {
    const action = blockAction('copy', agentsMd, RULE_ID, RULE);
    await applyBlockActions(agentsMd, [action], assetRoot);
    const once = await readFile(agentsMd, 'utf-8');
    await applyBlockActions(agentsMd, [action], assetRoot);
    expect(await readFile(agentsMd, 'utf-8')).toBe(once);
  });

  it('writes two blocks to one document in a single pass', async () => {
    const secondRel = 'rules/second.md';
    const secondId = formatBlockId(PKG, secondRel);
    await writeFile(join(assetRoot, secondRel), '# Second\n', 'utf-8');

    await applyBlockActions(
      agentsMd,
      [
        blockAction('copy', agentsMd, RULE_ID, RULE),
        blockAction('copy', agentsMd, secondId, secondRel),
      ],
      assetRoot,
    );
    const next = await readFile(agentsMd, 'utf-8');
    expect(next).toContain(RULE_ID);
    expect(next).toContain(secondId);
  });

  it('overwrites a diverged block with the source body', async () => {
    await mkdir(join(tmp, 'nested'), { recursive: true });
    await writeFile(agentsMd, upsertBlock('', RULE_ID, '# Edited\n'), 'utf-8');

    await applyBlockActions(
      agentsMd,
      [blockAction('warn-diverged', agentsMd, RULE_ID, RULE)],
      assetRoot,
    );
    expect(await readFile(agentsMd, 'utf-8')).toContain(
      'Validate at the boundary.',
    );
  });

  it('deletes only the named block, keeping a foreign one intact', async () => {
    const foreignId = formatBlockId('@winglet/json', 'rules/json.md');
    await mkdir(join(tmp, 'nested'), { recursive: true });
    const original = upsertBlock('', foreignId, '# JSON\n');
    await writeFile(
      agentsMd,
      upsertBlock(original, RULE_ID, RULE_BODY),
      'utf-8',
    );

    await applyBlockActions(
      agentsMd,
      [blockAction('delete', agentsMd, RULE_ID, RULE)],
      assetRoot,
    );
    expect(await readFile(agentsMd, 'utf-8')).toBe(original);
  });

  it('leaves no document behind when a delete empties it', async () => {
    await mkdir(join(tmp, 'nested'), { recursive: true });
    await writeFile(agentsMd, upsertBlock('', RULE_ID, RULE_BODY), 'utf-8');

    await applyBlockActions(
      agentsMd,
      [blockAction('delete', agentsMd, RULE_ID, RULE)],
      assetRoot,
    );
    expect(await readFile(agentsMd, 'utf-8')).toBe('');
  });
});

describe('core/injectDocs — applyAction', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-apply-file-'));
    await mkdir(join(tmp, 'assets', 'skills'), { recursive: true });
    await writeFile(join(tmp, 'assets', 'skills', 'a.md'), 'source\n', 'utf-8');
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('copies a file, creating missing parent directories', async () => {
    const dstAbs = join(tmp, 'out', 'skills', 'a.md');
    await applyAction(
      {
        kind: 'copy',
        relPath: 'skills/a.md',
        target: { kind: 'file', dstAbs },
      },
      join(tmp, 'assets'),
    );
    expect(await readFile(dstAbs, 'utf-8')).toBe('source\n');
  });

  it('ignores a block target — those go through applyBlockActions', async () => {
    const fileAbs = join(tmp, 'AGENTS.md');
    await applyAction(
      blockAction('copy', fileAbs, RULE_ID, RULE),
      join(tmp, 'assets'),
    );
    await expect(readFile(fileAbs, 'utf-8')).rejects.toThrow();
  });
});
