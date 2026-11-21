// r4-agents-assets-sync, angle BS1 (measurement): how planning and applying
// rule blocks scale with the number of blocks in one AGENTS.md. Each block is
// located by a scan from the start of the document, once while planning and
// once while applying. Internal fixture: the core primitives.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import {
  findBlockBody,
  formatBlockId,
  upsertBlock,
} from '../../core/markerBlock/index.js';

function measure(blocks: number, bodyBytes: number): number {
  const body = `${'x'.repeat(bodyBytes - 1)}\n`;
  const ids = Array.from({ length: blocks }, (_, index) =>
    formatBlockId(`@probe/p${index % 30}`, `rules/r${index}.md`),
  );
  const started = performance.now();
  let content = '# Notes\n';
  for (const id of ids) content = upsertBlock(content, id, body);
  for (const id of ids) findBlockBody(content, id);
  for (const id of ids) content = upsertBlock(content, id, body);
  return performance.now() - started;
}

it('measurement: time per block stays flat as the block count grows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'r4-scale-'));
  try {
    const small = measure(250, 2048);
    const large = measure(1000, 2048);
    // Four times the blocks; linear work would take about four times as long.
    console.log(
      JSON.stringify({ ms250: Math.round(small), ms1000: Math.round(large) }),
    );
    expect(large / small).toBeLessThan(8);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
