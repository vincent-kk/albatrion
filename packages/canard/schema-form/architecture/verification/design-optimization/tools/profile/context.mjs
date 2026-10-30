// Node CLI scripts read D0_RUN_DIR at startup; all mutable profile artifacts live there.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

if (process.env.NODE_ENV !== 'production')
  throw new Error('Launch with NODE_ENV=production');
if (Number(process.versions.node.split('.')[0]) !== 26)
  throw new Error('Node 26 is required');
const runDir = process.env.D0_RUN_DIR;
if (
  !runDir ||
  !/^\/private\/tmp\/claude-501\/perf-runs\/\d{8}T\d{4}-[a-f0-9]{7}-[a-zA-Z0-9-]+$/.test(
    runDir.replace(/\.noindex$/, ''),
  )
)
  throw new Error(
    'Set D0_RUN_DIR to an external run directory; see tools/README.md',
  );
fs.mkdirSync(runDir, { recursive: true });
const context = {
  runDir,
  packageDir: fileURLToPath(new URL('../../../../../', import.meta.url)),
  engines: pathToFileURL(path.join(runDir, 'engines') + '/'),
  profiles: pathToFileURL(path.join(runDir, 'prof') + '/'),
};
export default context;
