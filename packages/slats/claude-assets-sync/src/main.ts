// Primary bin entry for @slats/claude-assets-sync.
//
// Drives the top-level `claude-sync` CLI (discover + inject + list + build-hashes).
// Consumer packages ship a 3-line re-export stub (`bin/claude-sync.mjs`) that
// calls `runCli(process.argv, { invokedFromBin: import.meta.url })` so that a
// bare invocation targets only the consumer's own package. This slats bin
// omits `invokedFromBin` so it stays a cross-consumer dispatcher.
import { runCli } from './commands/index.js';
import { VERSION } from './utils/version.js';

runCli(process.argv, { version: VERSION }).catch((err) => {
  process.stderr.write(
    `[claude-assets-sync] ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
