import { type Scope, isValidScope } from '../../../core/index.js';
import { logger } from '../../../utils/logger.js';

/**
 * Legacy (non-TTY / --json) scope resolver.
 *
 * The TTY Ink path owns its own scope picker via `ui/components/ScopePicker`.
 * This helper runs only after `renderOrFallback` has chosen the legacy path,
 * where prompting is not appropriate — either stdout is piped or the caller
 * asked for structured `--json` output. Missing flag → exit 2.
 */
export function resolveScopeFlag(flag: string | undefined): Scope {
  if (flag) {
    if (!isValidScope(flag)) {
      logger.error(`Invalid --scope: ${flag}. Expected user | project.`);
      process.exit(2);
    }
    return flag;
  }
  logger.error('--scope is required in non-interactive environments.');
  logger.error('  Pass --scope=user or --scope=project.');
  process.exit(2);
}
