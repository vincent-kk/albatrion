// Invoked by count tests; run the diagnostic tool with a private bundle directory.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../../../../../../', import.meta.url));
const tool = resolve(packageRoot, 'architecture/verification/07-switch/tools/measure-react-render-counts.mjs');
const outputDirectory = mkdtempSync(join(tmpdir(), `schema-form-react-counts-${process.pid}-`));
try {
  const result = spawnSync(process.execPath, [tool, ...process.argv.slice(2),
    '--counts-only', '--all-writes', '--layout-effects', `--output-dir=${outputDirectory}`],
  { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
