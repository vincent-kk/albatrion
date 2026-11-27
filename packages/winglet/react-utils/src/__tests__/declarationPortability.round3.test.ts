import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('round-3 react-utils 2: inferred consumer declarations do not expose private callback aliases', () => {
  const directory = mkdtempSync(join(tmpdir(), 'react-utils-declarations-'));
  try {
    const workspace = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../..',
    );
    symlinkSync(
      join(workspace, 'node_modules'),
      join(directory, 'node_modules'),
      'dir',
    );
    const consumer = join(directory, 'consumer.mts');
    writeFileSync(
      consumer,
      `import { useVersion } from '@winglet/react-utils';
export const useBridge = () => useVersion()[1];
`,
    );
    const result = spawnSync(
      process.execPath,
      [
        createRequire(import.meta.url).resolve('typescript/lib/tsc.js'),
        '--declaration',
        '--emitDeclarationOnly',
        '--module',
        'Node16',
        '--moduleResolution',
        'Node16',
        '--target',
        'ES2022',
        '--skipLibCheck',
        '--outDir',
        join(directory, 'output'),
        consumer,
      ],
      { encoding: 'utf8' },
    );
    expect(result.stdout + result.stderr).toBe('');
    expect(result.status).toBe(0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
