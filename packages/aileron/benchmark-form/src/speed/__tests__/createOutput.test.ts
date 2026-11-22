import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

import { createOutput } from '../createOutput';

it('refuses to overwrite an existing output directory', async () => {
  const parent = await mkdtemp(join(tmpdir(), 'speed-output-'));
  try {
    const path = join(parent, 'run');
    await createOutput(path);
    await expect(createOutput(path)).rejects.toThrow();
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
