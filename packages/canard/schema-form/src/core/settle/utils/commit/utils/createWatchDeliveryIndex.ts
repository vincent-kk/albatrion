import type { SchemaNodeRuntime } from '../../../../record';

/** One resolved pointer prefix in the live reverse watch index. */
interface WatchPathNode {
  /** Watchers bound to this exact resolved path. */
  watchers: Set<unknown>;
  /** Child segments leading to deeper watched paths. */
  children: Map<string, WatchPathNode>;
}

/** Keep only live effective watch edges, including the separate context slot. */
class WatchDeliveryIndex {
  /** Every node with at least one effective watch path. */
  readonly allNodes = new Set<unknown>();
  /** Nodes watching the tree context reference. */
  readonly contextNodes = new Set<unknown>();
  /** Resolved paths retained for each live watcher. */
  private readonly pathsByNode = new Map<unknown, readonly string[]>();
  /** Root of the resolved path prefix tree. */
  private readonly root: WatchPathNode = {
    watchers: new Set(), children: new Map(),
  };

  /** Replace one node's effective watch paths in the live index. */
  update(node: unknown, paths: readonly string[]): void {
    const previous = this.pathsByNode.get(node);
    if (previous?.length === paths.length &&
      previous.every((path, index) => path === paths[index])) return;
    this.remove(node);
    const unique: string[] = [];
    for (const path of paths) if (!unique.includes(path)) unique.push(path);
    if (unique.length === 0) return;
    this.pathsByNode.set(node, unique);
    this.allNodes.add(node);
    for (const path of unique) {
      if (path === '@') {
        this.contextNodes.add(node);
        continue;
      }
      let current = this.root;
      for (const segment of path.split('/').filter(Boolean)) {
        let child = current.children.get(segment);
        if (!child) {
          child = { watchers: new Set(), children: new Map() };
          current.children.set(segment, child);
        }
        current = child;
      }
      current.watchers.add(node);
    }
  }

  /** Remove a detached or no longer watching node and prune empty paths. */
  remove(node: unknown): void {
    const paths = this.pathsByNode.get(node);
    if (!paths) return;
    this.pathsByNode.delete(node);
    this.allNodes.delete(node);
    this.contextNodes.delete(node);
    for (const path of paths) {
      if (path === '@') continue;
      const segments = path.split('/').filter(Boolean);
      const parents: WatchPathNode[] = [this.root];
      for (const segment of segments) {
        const child = parents[parents.length - 1].children.get(segment);
        if (!child) break;
        parents.push(child);
      }
      if (parents.length !== segments.length + 1) continue;
      parents[parents.length - 1].watchers.delete(node);
      for (let index = segments.length - 1; index >= 0; index--) {
        const child = parents[index + 1];
        if (child.watchers.size || child.children.size) break;
        parents[index].children.delete(segments[index]);
      }
    }
  }

  /** Add watchers whose paths contain or descend from a changed path. */
  affected(path: string, candidates: Set<unknown>): void {
    let current: WatchPathNode | undefined = this.root;
    for (const watcher of current.watchers) candidates.add(watcher);
    for (const segment of path.split('/').filter(Boolean)) {
      current = current.children.get(segment);
      if (!current) return;
      for (const watcher of current.watchers) candidates.add(watcher);
    }
    const pending = [...current.children.values()];
    while (pending.length) {
      const child = pending.pop();
      if (!child) continue;
      for (const watcher of child.watchers) candidates.add(watcher);
      for (const next of child.children.values()) pending.push(next);
    }
  }
}

/**
 * Allocate the tree's reverse watch index only when a watch first appears.
 * @returns A fresh live reverse watch index for one tree
 */
export const createWatchDeliveryIndex = <Self>():
  NonNullable<SchemaNodeRuntime<Self>['deliveryWatchIndex']> =>
  new WatchDeliveryIndex();
