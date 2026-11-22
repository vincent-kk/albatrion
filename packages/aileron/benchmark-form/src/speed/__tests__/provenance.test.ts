import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';

import { provenance } from '../provenance';

it('records nested versions and detects multiple React copies and escapes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'speed-provenance-'));
  const outside = await mkdtemp(join(tmpdir(), 'speed-provenance-external-'));
  try {
    const files = [];
    for (const [directory, name, version] of [
      [join(root, 'one'), 'react', '1'],
      [join(root, 'two'), 'react', '2'],
      [outside, '@winglet/test', '1'],
    ]) {
      await mkdir(directory, { recursive: true });
      await writeFile(
        join(directory, 'package.json'),
        JSON.stringify({ name, version }),
      );
      const file = join(directory, 'index.js');
      await writeFile(file, '');
      files.push(pathToFileURL(file).href);
    }
    const result = provenance(files, root);
    expect(
      result.packages.filter((item) => item.name === 'react'),
    ).toHaveLength(2);
    expect(result.leaks).toHaveLength(2);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
