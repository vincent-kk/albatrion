import pc from 'picocolors';

/**
 * Logger utility with colored output
 */
export const logger = {
  /**
   * Log info message
   */
  info(message: string): void {
    console.log(pc.blue('info'), message);
  },

  /**
   * Log success message
   */
  success(message: string): void {
    console.log(pc.green('success'), message);
  },

  /**
   * Log warning message
   */
  warn(message: string): void {
    console.log(pc.yellow('warn'), message);
  },

  /**
   * Log error message
   */
  error(message: string): void {
    console.log(pc.red('error'), message);
  },

  /**
   * Log debug message (only in verbose mode)
   */
  debug(message: string): void {
    if (process.env.VERBOSE) {
      console.log(pc.gray('debug'), message);
    }
  },

  /**
   * Log a step in the sync process
   */
  step(step: string, detail?: string): void {
    const stepText = pc.cyan(`[${step}]`);
    console.log(stepText, detail || '');
  },

  /**
   * Log file operation
   */
  file(operation: 'create' | 'update' | 'skip', path: string): void {
    const colors = {
      create: pc.green,
      update: pc.yellow,
      skip: pc.gray,
    };
    const symbols = {
      create: '+',
      update: '~',
      skip: '-',
    };
    console.log(`  ${colors[operation](symbols[operation])} ${path}`);
  },

  /**
   * Log package sync start
   */
  packageStart(packageName: string): void {
    console.log();
    console.log(pc.bold(pc.cyan(`Syncing ${packageName}...`)));
  },

  /**
   * Log package sync result
   */
  packageEnd(
    _packageName: string,
    result: { success: boolean; skipped: boolean; reason?: string },
  ): void {
    if (result.skipped)
      console.log(pc.gray(`  Skipped: ${result.reason || 'Unknown reason'}`));
    else if (result.success) console.log(pc.green(`  Completed successfully`));
    else console.log(pc.red(`  Failed: ${result.reason || 'Unknown error'}`));
  },

  /**
   * Log summary at the end
   */
  summary(results: { success: number; skipped: number; failed: number }): void {
    console.log();
    console.log(pc.bold('Summary:'));
    console.log(`  ${pc.green('Success:')} ${results.success}`);
    console.log(`  ${pc.gray('Skipped:')} ${results.skipped}`);
    if (results.failed > 0)
      console.log(`  ${pc.red('Failed:')} ${results.failed}`);
  },

  /**
   * Log dry-run notice
   */
  dryRunNotice(): void {
    console.log();
    console.log(
      pc.yellow(pc.bold('[DRY RUN] No files will be created or modified.')),
    );
    console.log();
  },
};
