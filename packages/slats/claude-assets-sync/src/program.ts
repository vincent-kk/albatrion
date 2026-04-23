import { Command } from 'commander';

import { registerDeprecatedCommands, registerInjectCommand } from './commands/index.js';
import { confirmForceAsync, selectScopeAsync } from './components/inject/index.js';
import { logger } from './utils/logger.js';

export interface ProgramOptions {
  packageName: string;
  packageVersion: string;
  packageRoot: string;
  assetRoot?: string;
  argv?: readonly string[];
}

export async function program(options: ProgramOptions): Promise<void> {
  const cmd = new Command();
  registerInjectCommand(cmd, {
    packageName: options.packageName,
    packageVersion: options.packageVersion,
    packageRoot: options.packageRoot,
    assetRoot: options.assetRoot,
    renderScopeSelect: selectScopeAsync,
    renderForceConfirm: confirmForceAsync,
  });
  registerDeprecatedCommands(cmd);

  try {
    await cmd.parseAsync(options.argv ? [...options.argv] : process.argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(message);
    process.exit(1);
  }
}
