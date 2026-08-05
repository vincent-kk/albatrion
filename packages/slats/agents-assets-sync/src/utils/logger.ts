import pc from 'picocolors';

// Diagnostics normally share stdout with the human-readable transcript. In
// `--json` mode stdout belongs to the document alone, so every level moves to
// stderr — a single stray line there would make the whole stream unparseable.
let write = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

/**
 * Route every subsequent log line to stderr instead of stdout.
 *
 * Called once, before any output, when the run will emit a machine-readable
 * document. There is no way back: a run is either a transcript or a document.
 */
export function divertLogsToStderr(): void {
  write = (line) => {
    process.stderr.write(`${line}\n`);
  };
}

/**
 * Logger utility with colored output
 */
export const logger = {
  /**
   * Log info message
   */
  info(message: string): void {
    write(`${pc.blue('info')} ${message}`);
  },

  /**
   * Log success message
   */
  success(message: string): void {
    write(`${pc.green('success')} ${message}`);
  },

  /**
   * Log warning message
   */
  warn(message: string): void {
    write(`${pc.yellow('warn')} ${message}`);
  },

  /**
   * Log error message
   */
  error(message: string): void {
    write(`${pc.red('error')} ${message}`);
  },

  /**
   * Log debug message (only in verbose mode)
   */
  debug(message: string): void {
    if (process.env.VERBOSE) {
      write(`${pc.gray('debug')} ${message}`);
    }
  },

  /**
   * Log a step in the sync process
   */
  step(step: string, detail?: string): void {
    const stepText = pc.cyan(`[${step}]`);
    write(`${stepText} ${detail || ''}`);
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
    write(`  ${colors[operation](symbols[operation])} ${path}`);
  },

  /**
   * Log package sync start
   */
  packageStart(packageName: string): void {
    write('');
    write(pc.bold(pc.cyan(`Syncing ${packageName}...`)));
  },

  /**
   * Log package sync result
   */
  packageEnd(
    _packageName: string,
    result: { success: boolean; skipped: boolean; reason?: string },
  ): void {
    if (result.skipped)
      write(pc.gray(`  Skipped: ${result.reason || 'Unknown reason'}`));
    else if (result.success) write(pc.green(`  Completed successfully`));
    else write(pc.red(`  Failed: ${result.reason || 'Unknown error'}`));
  },

  /**
   * Log summary at the end
   */
  summary(results: { success: number; skipped: number; failed: number }): void {
    write('');
    write(pc.bold('Summary:'));
    write(`  ${pc.green('Success:')} ${results.success}`);
    write(`  ${pc.gray('Skipped:')} ${results.skipped}`);
    if (results.failed > 0)
      write(`  ${pc.red('Failed:')} ${results.failed}`);
  },

  /**
   * Log dry-run notice
   */
  dryRunNotice(): void {
    write('');
    write(pc.yellow(pc.bold('[DRY RUN] No files will be created or modified.')));
    write('');
  },

  /**
   * Top-level section heading with a distinct accent.
   */
  heading(message: string): void {
    write('');
    write(pc.bold(pc.cyan(`▸ ${message}`)));
  },

  /**
   * Inline accent — cyan bold, for short labels interleaved with content.
   */
  accent(message: string): string {
    return pc.cyan(pc.bold(message));
  },
};
