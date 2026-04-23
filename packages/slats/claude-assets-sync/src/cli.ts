// Primary bin entry for @slats/claude-assets-sync v0.4+.
//
// Drives the top-level `claude-sync` CLI (discover + inject + list + build-hashes).
// Consumer packages ship a 3-line re-export stub (`bin/claude-sync.mjs`) that
// calls `runCli(process.argv)` from this package's `.` entry.
import { runCli } from './commands/root.js';
import { VERSION } from './version.js';

runCli(process.argv, { version: VERSION }).catch((err) => {
  process.stderr.write(
    `[claude-assets-sync] ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
