#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';

runCli(process.argv).catch((err) => {
  process.stderr.write(
    `[@canard/schema-form] claude-sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
