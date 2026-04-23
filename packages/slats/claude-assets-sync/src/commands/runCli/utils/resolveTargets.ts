import type { ConsumerPackage } from '../../../discover/index.js';
import { logger } from '../../../utils/logger.js';
import type { DefaultFlags } from '../type.js';

export function resolveTargets(
  all: ConsumerPackage[],
  flags: DefaultFlags,
  cwdPackageName: string | null,
  invokedPackageName: string | null,
): ConsumerPackage[] {
  if (flags.all) return all;
  if (flags.package) {
    const match = all.find((p) => p.name === flags.package);
    if (!match) {
      logger.error(`No consumer found with package name "${flags.package}"`);
      logger.error(`  Available: ${all.map((p) => p.name).join(', ')}`);
      process.exit(1);
    }
    return [match];
  }
  if (cwdPackageName) {
    const match = all.find((p) => p.name === cwdPackageName);
    if (match) return [match];
  }
  if (invokedPackageName) {
    const match = all.find((p) => p.name === invokedPackageName);
    if (match) return [match];
  }
  if (all.length === 1) return all;
  logger.error(
    'Multiple consumer packages discovered; specify --package=<name> or --all.',
  );
  logger.error(`  Available: ${all.map((p) => p.name).join(', ')}`);
  process.exit(2);
}
