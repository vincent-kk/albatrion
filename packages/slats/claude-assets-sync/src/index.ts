#!/usr/bin/env node
import { run } from './cli';

// Export for programmatic use
export { syncPackage, syncPackages } from './core/sync';
export { createProgram, run } from './cli';
export type {
  AssetType,
  CliOptions,
  ClaudeConfig,
  GitHubRepoInfo,
  PackageInfo,
  SyncMeta,
  SyncResult,
} from './utils/types';

// Run CLI when executed directly
run().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
