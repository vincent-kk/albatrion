import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type { PathKeyMode } from '../../../utils/pathIndex/type';

/** Indexed native Map whose reads explicitly request the owning lazy projection. */
export class LazyInactiveMap<Value> extends PathKeyedMap<Value> {
  /** Install callbacks after construction so initial indexed inserts remain ordinary. */
  constructor(
    mode: PathKeyMode,
    entries: Iterable<readonly [string, Value]>,
    private readonly readKey?: (key: string) => void,
    private readonly readAll?: () => void,
  ) {
    super(mode, entries);
  }
  /** Materialize exactly the requested projection before lookup. */
  override get(key: string): Value | undefined {
    this.readKey?.(key);
    return super.get(key);
  }
  /** Presence queries observe the same committed projection as get. */
  override has(key: string): boolean {
    this.readKey?.(key);
    return super.has(key);
  }
  /** Enumeration requests all committed paths. */
  override [Symbol.iterator](): MapIterator<[string, Value]> {
    this.readAll?.();
    return super[Symbol.iterator]();
  }
  /** Explicit entry iteration follows native Map order. */
  override entries(): MapIterator<[string, Value]> {
    this.readAll?.();
    return super.entries();
  }
  /** Key iteration includes unmaterialized committed hosts. */
  override keys(): MapIterator<string> {
    this.readAll?.();
    return super.keys();
  }
  /** Value iteration includes every committed publication. */
  override values(): MapIterator<Value> {
    this.readAll?.();
    return super.values();
  }
  /** Size observes the complete committed projection. */
  override get size(): number {
    this.readAll?.();
    return super.size;
  }
  /** Native callback iteration observes the same complete projection. */
  override forEach(
    callback: (value: Value, key: string, map: Map<string, Value>) => void,
    thisArg?: unknown,
  ): void {
    this.readAll?.();
    super.forEach(callback, thisArg);
  }
}
