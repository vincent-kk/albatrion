import { PathStoreIndex } from './utils/PathStoreIndex';

/** Native Set with explicit exact, ancestor and numeric-slot mutation semantics. */
export class PathKeyedSet extends Set<string> {
  /** Persistent lookup metadata owned from construction. */
  readonly pathIndex = new PathStoreIndex();

  /** Create an empty indexed set before inserting optional initial paths. */
  constructor(paths?: Iterable<string>) {
    super();
    if (paths) for (const path of paths) this.add(path);
  }

  /** Register a new path once. */
  override add(path: string): this {
    if (!this.has(path)) this.pathIndex.add(path, [path]);
    return super.add(path);
  }

  /** Remove a path from values and lookup metadata. */
  override delete(path: string): boolean {
    this.pathIndex.delete(path);
    return super.delete(path);
  }

  /** Clear both surfaces. */
  override clear(): void {
    this.pathIndex.clear();
    super.clear();
  }

  /** Replace distinct affected paths with surviving destinations in two phases. */
  replacePaths(moves: readonly { previous: string; current?: string }[]): void {
    this.pathIndex.beginBatch();
    try {
      for (const move of moves) {
        this.pathIndex.delete(move.previous);
        super.delete(move.previous);
      }
      for (const move of moves) if (move.current !== undefined) {
        this.pathIndex.add(move.current, [move.current]);
        super.add(move.current);
      }
    } finally { this.pathIndex.endBatch(); }
  }
}
