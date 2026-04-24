import {
  type Scope,
  isInteractive,
  isValidScope,
} from '../../../core/index.js';
import { selectScopeAsync } from '../../../prompts/index.js';
import { logger } from '../../../utils/logger.js';

export async function resolveScopeFlag(
  flag: string | undefined,
): Promise<Scope> {
  if (flag) {
    if (!isValidScope(flag)) {
      logger.error(`Invalid --scope: ${flag}. Expected user | project.`);
      process.exit(2);
    }
    return flag;
  }
  if (!isInteractive()) {
    logger.error('--scope is required in non-interactive environments.');
    logger.error('  Pass --scope=user | --scope=project.');
    process.exit(2);
  }
  return selectScopeAsync();
}
