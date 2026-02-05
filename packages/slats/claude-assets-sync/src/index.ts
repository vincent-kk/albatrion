#!/usr/bin/env node
import { run } from './core/cli.js';

// Export for programmatic use
export { syncPackage, syncPackages } from './core/sync';
export { createProgram, run } from './core/cli.js';
export { migrateToFlat, needsMigration } from './core/migration';
export type { MigrationResult } from './core/migration';
export type {
  AssetType,
  CliOptions,
  ClaudeConfig,
  GitHubRepoInfo,
  PackageInfo,
  SyncMeta,
  SyncResult,
  UnifiedSyncMeta,
  PackageSyncInfo,
  FileMapping,
} from './utils/types';

// Run CLI when executed directly
run().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
