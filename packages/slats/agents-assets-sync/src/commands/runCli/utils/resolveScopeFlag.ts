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
  const parsed = parseScopeFlag(flag);
  if ('error' in parsed) {
    for (const line of parsed.error) logger.error(line);
    process.exit(2);
  }
  return parsed.scope;
}

/**
 * Same validation as `resolveScopeFlag`, reporting instead of exiting.
 *
 * @param flag - raw `--scope` value
 * @returns the scope, or the message lines describing why there is none
 */
export function parseScopeFlag(
  flag: string | undefined,
): { scope: Scope } | { error: string[] } {
  if (flag) {
    if (!isValidScope(flag))
      return { error: [`Invalid --scope: ${flag}. Expected user | project.`] };
    return { scope: flag };
  }
  return {
    error: [
      '--scope is required in non-interactive environments.',
      '  Pass --scope=user or --scope=project.',
    ],
  };
}
