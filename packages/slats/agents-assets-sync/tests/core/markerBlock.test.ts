import { describe, expect, it } from 'vitest';

import { hashContent } from '../../src/core/hash/index.js';
import {
  MARKER_PREFIX,
  blockBodyMatches,
  findBlockBody,
  formatBlockId,
  parseBlocks,
  removeBlock,
  upsertBlock,
} from '../../src/core/markerBlock/index.js';

const PKG = '@canard/schema-form';
const REL = 'rules/schema-form-rule.md';
const ID = `${PKG}:${REL}`;
const BODY = '# Schema Form Rule\n\nAlways validate at the boundary.\n';

// A foreign block written by another tool. Every operation here must leave it
// byte-identical — AGENTS.md is shared ground, not this tool's file.
const FOREIGN = [
  '<!-- FILID:START:filid_fractal-boundaries.md -->',
  '# Fractal Boundaries',
  '<!-- FILID:END:filid_fractal-boundaries.md -->',
].join('\n');

describe('core/markerBlock', () => {
  it('formatBlockId joins package and relPath', () => {
    expect(formatBlockId(PKG, REL)).toBe(ID);
  });

  it('upsertBlock appends a block to an empty document', () => {
    const next = upsertBlock('', ID, BODY);
    expect(next).toContain(`<!-- ${MARKER_PREFIX}:START:${ID} -->`);
    expect(next).toContain(`<!-- ${MARKER_PREFIX}:END:${ID} -->`);
    expect(findBlockBody(next, ID)).toBe(BODY);
  });

  it('upsertBlock is idempotent — a second identical write changes nothing', () => {
    const once = upsertBlock('', ID, BODY);
    expect(upsertBlock(once, ID, BODY)).toBe(once);
  });

  it('upsertBlock replaces an existing block in place, not by appending', () => {
    const once = upsertBlock('', ID, BODY);
    const twice = upsertBlock(once, ID, '# Replaced\n');
    expect(findBlockBody(twice, ID)).toBe('# Replaced\n');
    expect(parseBlocks(twice)).toHaveLength(1);
  });

  it('preserves foreign blocks and free text around its own block', () => {
    const original = `${FOREIGN}\n\nHand-written note.\n`;
    const next = upsertBlock(original, ID, BODY);
    expect(next.startsWith(original)).toBe(true);
    expect(removeBlock(next, ID)).toBe(original);
  });

  it('parseBlocks reads only this tool blocks, with package and relPath split', () => {
    const doc = upsertBlock(`${FOREIGN}\n`, ID, BODY);
    const blocks = parseBlocks(doc);
    expect(blocks).toEqual([
      { blockId: ID, packageName: PKG, relPath: REL, body: BODY },
    ]);
  });

  it('keeps two blocks independent in one document', () => {
    const other = formatBlockId('@winglet/json', 'rules/json-rule.md');
    let doc = upsertBlock('', ID, BODY);
    doc = upsertBlock(doc, other, '# JSON\n');

    expect(parseBlocks(doc).map((b) => b.blockId)).toEqual([ID, other]);

    const pruned = removeBlock(doc, ID);
    expect(findBlockBody(pruned, ID)).toBeNull();
    expect(findBlockBody(pruned, other)).toBe('# JSON\n');
  });

  it('removeBlock leaves a document without that block untouched', () => {
    const doc = `${FOREIGN}\n`;
    expect(removeBlock(doc, ID)).toBe(doc);
  });

  it('round-trips a body that does not end with a newline', () => {
    const noTrailing = '# No trailing newline';
    const doc = upsertBlock('', ID, noTrailing);
    // One newline is added so the END marker owns its own line; the body is
    // recovered by hash comparison rather than by exact bytes.
    expect(
      blockBodyMatches(findBlockBody(doc, ID)!, hashContent(noTrailing)),
    ).toBe(true);
  });

  it('blockBodyMatches accepts an exact body and rejects a changed one', () => {
    expect(blockBodyMatches(BODY, hashContent(BODY))).toBe(true);
    expect(blockBodyMatches('# Edited\n', hashContent(BODY))).toBe(false);
  });
});
