// Loaded by bench:form through tsx; CLI flags select core cases and optional baseline checkout.
import { fileURLToPath } from 'node:url';

import { runCoreBenchmark } from './core/runCoreBenchmark.ts';

await runCoreBenchmark(
  process.argv.slice(2),
  fileURLToPath(new URL('../../../..', import.meta.url)),
  process.cwd(),
  process.env.CI === 'true',
);
