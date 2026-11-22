// Child-process entry for interruptedWrite.test.ts: runs the public runCli
// from source (the built dist is older than src). Loaded with
// `node --import tsx`, so it is not collected by Vitest.
import { runCli } from '../../index.js';

await runCli(process.argv);
