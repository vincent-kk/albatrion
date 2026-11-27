import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SyncPlan } from './planSync';

/**
 * Applies a sync plan to the file system: deletes first, so a page whose
 * name changes only in case is recreated rather than lost on a
 * case-insensitive file system, then writes, creating directories as needed.
 * A directory a delete leaves empty is removed.
 *
 * @param plan - A plan whose `errors` is empty; its paths are absolute.
 */
export function applySyncPlan(plan: SyncPlan): void {
  for (const filePath of plan.deletes) {
    fs.unlinkSync(filePath);
    const dir = path.dirname(filePath);
    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  }
  for (const { path: filePath, content } of plan.writes) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}
