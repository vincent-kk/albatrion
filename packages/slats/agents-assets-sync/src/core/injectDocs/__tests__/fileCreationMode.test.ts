import { chmodSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import { applyAction } from '../utils/applyAction.js';

it.each([0o755, 0o444])('retains source mode %o when creating a new asset', async (mode) => {
  const root = mkdtempSync(join(tmpdir(), 'asset-mode-'));
  try {
    writeFileSync(join(root, 'source'), '#!/bin/sh\n');
    chmodSync(join(root, 'source'), mode);
    const target = join(root, 'destination');
    await applyAction({ kind: 'copy', relPath: 'source', target: { kind: 'file', dstAbs: target } }, root);
    expect(statSync(target).mode & 0o777).toBe(mode);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
