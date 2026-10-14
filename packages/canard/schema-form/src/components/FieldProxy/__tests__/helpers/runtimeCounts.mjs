// Invoked by count tests; run the diagnostic tool with a private bundle directory.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareReactBundles } from '../../../../../architecture/verification/07-switch/tools/prepare-react-bundles.mjs';

const packageRoot = fileURLToPath(
  new URL('../../../../../', import.meta.url),
);
const tool = resolve(
  packageRoot,
  'architecture/verification/07-switch/tools/measure-react-render-counts.mjs',
);
const outputDirectory = mkdtempSync(
  join(tmpdir(), `schema-form-react-counts-${process.pid}-`),
);
try {
  const args = process.argv.slice(2);
  if (args[0] === 'current') {
    const [bundle] = await prepareReactBundles(
      packageRoot,
      outputDirectory,
      'change',
      {
        entry: resolve(
          packageRoot,
          'src/__tests__/fixtures/runtimeCounts.entry.tsx',
        ),
      },
    );
    args[0] = 'change';
    args.push(`--bundle=${bundle.file}`);
  }
  const result = spawnSync(
    process.execPath,
    [
      tool,
      ...args,
      '--counts-only',
      '--all-writes',
      '--layout-effects',
      `--output-dir=${outputDirectory}`,
    ],
    { stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
