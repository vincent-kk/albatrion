import { logger } from '../../../utils/logger.js';
import type { InjectPlan } from '../../buildPlan/index.js';

export function printPlan(plan: InjectPlan): void {
  for (const a of plan.actions) {
    if (a.kind === 'copy') logger.file('create', a.relPath);
    else if (a.kind === 'skip-uptodate')
      logger.file('skip', `${a.relPath} (up-to-date)`);
    else if (a.kind === 'warn-diverged')
      logger.warn(
        `${a.relPath} — local differs from source (user edit or version change)`,
      );
    else if (a.kind === 'warn-orphan')
      logger.warn(`${a.relPath} — present locally, absent in source`);
    else if (a.kind === 'delete')
      logger.file('update', `${a.relPath} (deleting)`);
  }
}
