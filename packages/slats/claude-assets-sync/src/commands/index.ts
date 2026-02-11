/**
 * Command registry and exports
 */

export * from './types';
export { runSyncCommand } from './sync';
export { runListCommand } from './list';
export { runRemoveCommand } from './remove';
export { runStatusCommand } from './status';
export { runMigrateCommand } from './migrate';
export { runAddCommand } from './add';
export { runUpdateCommand } from './update';
export type { AddCommandOptions } from './add';
export type { UpdateCommandOptions } from './update';

/**
 * Command metadata for CLI help and documentation
 */
export const COMMANDS = {
  sync: {
    name: 'sync',
    description: 'Sync Claude assets from npm packages',
    options: [
      { flag: '-p, --package <name>', description: 'Package name to sync' },
      {
        flag: '-f, --force',
        description: 'Force sync even if version matches',
      },
      {
        flag: '--dry-run',
        description: 'Preview changes without writing files',
      },
      { flag: '-l, --local', description: 'Read from local workspace' },
      { flag: '-r, --ref <ref>', description: 'Git ref to fetch from' },
      { flag: '--no-flat', description: 'Use legacy nested structure' },
    ],
  },
  add: {
    name: 'add',
    description: 'Add a package with interactive asset selection',
    options: [
      { flag: '-p, --package <name>', description: 'Package name to add' },
      { flag: '-l, --local', description: 'Read from local workspace' },
      { flag: '-r, --ref <ref>', description: 'Git ref to fetch from' },
    ],
  },
  list: {
    name: 'list',
    description: 'List all synced packages',
    options: [{ flag: '--json', description: 'Output as JSON' }],
  },
  remove: {
    name: 'remove',
    description: 'Remove a synced package',
    options: [
      { flag: '-p, --package <name>', description: 'Package name to remove' },
      { flag: '-y, --yes', description: 'Skip confirmation prompt' },
      {
        flag: '--dry-run',
        description: 'Preview changes without removing files',
      },
    ],
  },
  status: {
    name: 'status',
    description: 'Show sync status of all packages',
    options: [
      { flag: '--no-remote', description: 'Skip remote version check' },
    ],
  },
  migrate: {
    name: 'migrate',
    description: 'Migrate from legacy to flat structure',
    options: [
      {
        flag: '--dry-run',
        description: 'Preview migration without making changes',
      },
    ],
  },
  update: {
    name: 'update',
    description: 'Update package metadata in .sync-meta.json',
    options: [
      { flag: '-p, --package <name>', description: 'Package name to update (default: all)' },
      { flag: '-l, --local', description: 'Read from local workspace' },
      { flag: '-r, --ref <ref>', description: 'Git ref to fetch from' },
      { flag: '--dry-run', description: 'Preview changes without writing' },
      { flag: '--sync', description: 'Re-sync files after updating metadata' },
    ],
  },
} as const;
