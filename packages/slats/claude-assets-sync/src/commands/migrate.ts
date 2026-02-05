/**
 * Migrate command - migrate from legacy to flat structure
 */
import { migrateToFlat } from '@/claude-assets-sync/core/migration';

import type { MigrateCommandOptions } from './types';

/**
 * Run the migrate command
 * @param options - Migration options
 */
export const runMigrateCommand = async (
  options: MigrateCommandOptions,
  cwd: string = process.cwd(),
): Promise<void> => {
  await migrateToFlat(cwd, { dryRun: options.dryRun });
};
