import { describe, expect, it } from 'vitest';

import { hashContent } from '../../hash/index.js';
import {
  blockBodyMatches,
  findBlockBody,
  formatBlockId,
  parseBlocks,
  removeBlock,
  upsertBlock,
} from '../markerBlock.js';

const ID = formatBlockId('@scope/pkg', 'rules/a.md');
const SOURCE = '# Rule\n\nline two\n';
const toCRLF = (text: string) => text.replace(/\n/g, '\r\n');

// What a `core.autocrlf=true` checkout makes of a document this tool wrote.
const CRLF_DOC = toCRLF(`# Project\n\n${upsertBlock('', ID, SOURCE)}tail\n`);

describe('core/markerBlock — CRLF line endings', () => {
  it('parses a block whose marker lines end in CRLF', () => {
    const blocks = parseBlocks(CRLF_DOC);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.blockId).toBe(ID);
    expect(blocks[0]?.body).toBe(toCRLF(SOURCE));
  });

  it('finds the CRLF block, so a rewrite replaces it instead of appending', () => {
    expect(findBlockBody(CRLF_DOC, ID)).toBe(toCRLF(SOURCE));
    const rewritten = upsertBlock(CRLF_DOC, ID, SOURCE);
    expect(parseBlocks(rewritten)).toHaveLength(1);
    expect(rewritten.startsWith('# Project\r\n\r\n')).toBe(true);
    expect(rewritten.endsWith('tail\r\n')).toBe(true);
  });

  it('removes the CRLF block together with its marker lines', () => {
    expect(removeBlock(CRLF_DOC, ID)).toBe('# Project\r\n\r\ntail\r\n');
  });

  it('judges a CRLF-converted body as matching its LF source', () => {
    const body = findBlockBody(CRLF_DOC, ID) ?? '';
    expect(blockBodyMatches(body, hashContent(SOURCE))).toBe(true);
    expect(blockBodyMatches(body, hashContent('# Rule\n\nedited\n'))).toBe(
      false,
    );
  });

  it('still matches a source that itself uses CRLF', () => {
    const source = toCRLF(SOURCE);
    const body = findBlockBody(upsertBlock('', ID, source), ID) ?? '';
    expect(blockBodyMatches(body, hashContent(source))).toBe(true);
  });
});
