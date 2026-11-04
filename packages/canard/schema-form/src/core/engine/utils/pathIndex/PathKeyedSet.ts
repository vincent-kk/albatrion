import { PathStoreIndex } from './utils/PathStoreIndex';

/** Native Set with explicit exact, ancestor and numeric-slot mutation semantics. */
export class PathKeyedSet extends Set<string> {
  /** Persistent lookup metadata owned from construction. */
  readonly pathIndex = new PathStoreIndex();
  /** Calls that changed the stored paths since construction. */
  private mutationCount = 0;

  /**
   * Count calls that changed the stored paths: an add of a new path, a delete
   * that removed one, every clear and every replacePaths. Equal counts read at
   * two moments mean no such call happened in between.
   */
  get mutations(): number {
    return this.mutationCount;
  }

  /** Create an empty indexed set before inserting optional initial paths. */
  constructor(paths?: Iterable<string>) {
    super();
    if (paths) for (const path of paths) this.add(path);
  }

  /** Register a new path once. */
  override add(path: string): this {
    if (!this.has(path)) {
      this.pathIndex.add(path, [path]);
      this.mutationCount++;
    }
    return super.add(path);
  }

  /** Remove a path from values and lookup metadata. */
  override delete(path: string): boolean {
    this.pathIndex.delete(path);
    const removed = super.delete(path);
    if (removed) this.mutationCount++;
    return removed;
  }

  /** Clear both surfaces. */
  override clear(): void {
    this.pathIndex.clear();
    super.clear();
    this.mutationCount++;
  }

  /** Replace distinct affected paths with surviving destinations in two phases. */
  replacePaths(moves: readonly { previous: string; current?: string }[]): void {
    this.mutationCount++;
    this.pathIndex.beginBatch();
    try {
      for (const move of moves) {
        this.pathIndex.delete(move.previous);
        super.delete(move.previous);
      }
      for (const move of moves)
        if (move.current !== undefined) {
          this.pathIndex.add(move.current, [move.current]);
          super.add(move.current);
        }
    } finally {
      this.pathIndex.endBatch();
    }
  }
}
