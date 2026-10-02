import { PathStoreIndex } from './utils/PathStoreIndex';
import { getStoreKeyPaths } from './utils/getStoreKeyPaths';
import type { PathKeyMode, PathKeyedMove } from './type';

/** Native Map whose declared mutation surface owns persistent path indexes. */
export class PathKeyedMap<Value> extends Map<string, Value> {
  /** Exact, ancestor and numeric-slot lookups updated by this class. */
  readonly pathIndex = new PathStoreIndex();

  /** Construct an empty indexed store, then insert any explicitly supplied entries. */
  constructor(
    private readonly mode: PathKeyMode,
    entries?: Iterable<readonly [string, Value]>,
  ) {
    super();
    if (entries) for (const [key, value] of entries) this.set(key, value);
  }

  /** Index newly inserted identities; value-only writes do not touch the index. */
  override set(key: string, value: Value): this {
    if (!this.has(key)) this.pathIndex.add(key, getStoreKeyPaths(key, this.mode));
    return super.set(key, value);
  }

  /** Remove an identity and every reference in its path index. */
  override delete(key: string): boolean {
    this.pathIndex.delete(key);
    return super.delete(key);
  }

  /** Clear values and all lookup metadata together. */
  override clear(): void {
    this.pathIndex.clear();
    super.clear();
  }

  /**
   * Replace affected identities in two phases without rebuilding surviving prefixes.
   * @param moves - Distinct existing keys and their decoded destinations
   * @returns Nothing; values retain identity unless the caller transformed them
   */
  replaceEntries(moves: readonly PathKeyedMove<Value>[]): void {
    this.pathIndex.beginBatch();
    try {
      for (const move of moves) {
        this.pathIndex.delete(move.previous);
        super.delete(move.previous);
      }
      for (const move of moves) if (move.key !== undefined) {
        this.pathIndex.add(move.key, move.paths);
        super.set(move.key, move.value);
      }
    } finally { this.pathIndex.endBatch(); }
  }
}
