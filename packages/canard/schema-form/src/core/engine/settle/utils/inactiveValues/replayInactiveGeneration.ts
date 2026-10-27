import type {
  InactiveGeneration,
  InactiveProjection,
} from '../../types/inactiveValues';
import { reconcileInactivePath } from './reconcileInactivePath';

/**
 * Apply one commit's relevant facts and record actual ancestor list changes.
 * @param view - Private host-local projection being advanced
 * @param generation - Immutable source and visibility delta
 * @param path - Projection's host range
 * @returns Nothing; the private view advances to this generation
 */
export const replayInactiveGeneration = (
  view: InactiveProjection,
  generation: InactiveGeneration,
  path: string,
): void => {
  const prefix = path + '/';
  const affected = new Set<string>();
  for (const [key, source] of generation.changes) {
    if (path && source.path !== path && !source.path.startsWith(prefix))
      continue;
    if (source.present) view.sources.set(key, source);
    else view.sources.delete(key);
    view.visibility.set(source.path, source.visible);
    affected.add(source.path);
  }
  for (const [changed, visible] of generation.visibility) {
    if (path && changed !== path && !changed.startsWith(prefix)) continue;
    view.visibility.set(changed, visible);
    affected.add(changed);
  }
  for (const changed of affected) {
    if (!reconcileInactivePath(view, generation, changed)) continue;
    let ancestor = changed;
    while (true) {
      let version = generation.versions.get(ancestor);
      if (!version) generation.versions.set(ancestor, (version = {}));
      view.versions?.set(ancestor, version);
      if (ancestor === path) view.version = version;
      if (!ancestor) break;
      ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
    }
  }
};
