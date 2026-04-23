import type { Command } from 'commander';

const REMOVED_COMMANDS = [
  'sync',
  'add',
  'list',
  'remove',
  'status',
  'migrate',
  'update',
] as const;

export function registerDeprecatedCommands(cmd: Command): void {
  for (const name of REMOVED_COMMANDS) {
    cmd
      .command(name)
      .description(`[removed in 0.2.0] Use "inject-docs" instead.`)
      .allowUnknownOption()
      .action(() => {
        process.stderr.write(
          `[claude-assets-sync] "${name}" was removed in 0.2.0.\n`,
        );
        process.stderr.write(
          '  See MIGRATION.md — use the package-owned `inject-docs` wrapper.\n',
        );
        process.exit(1);
      });
  }
}
