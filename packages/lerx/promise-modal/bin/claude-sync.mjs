#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';

runCli(process.argv, { invokedFromBin: import.meta.url }).catch((err) => {
  process.stderr.write(
    `[@lerx/promise-modal] claude-sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
