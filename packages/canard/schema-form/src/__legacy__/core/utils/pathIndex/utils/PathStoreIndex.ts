import { NumericPathIndex } from './utils/NumericPathIndex';
import { isCanonicalArraySlot } from './utils/isCanonicalArraySlot';

/** A unique prefix caches its ancestry and numeric classification across writes. */
interface PathPrefix {
  /** Absolute JSON Pointer prefix, including the empty root. */
  path: string;
  /** Parent reference avoids slicing on every key deletion or insertion. */
  parent?: PathPrefix;
  /** Last escaped segment, classified once when this prefix is constructed. */
  segment: string;
  /** Whether the segment addresses a canonical safe-integer array slot. */
  numeric: boolean;
  /** Keys whose occurrence paths lie at or below this prefix. */
  keys: Set<string>;
  /** Keys with an occurrence exactly at this prefix. */
  exact: Set<string>;
}

/** Persistent path index; batch replacement retains shared prefix and radix nodes. */
export class PathStoreIndex {
  /** Full occurrence prefixes for each serialized key. */
  private readonly pathsByKey = new Map<string, readonly PathPrefix[]>();
  /** Unique prefixes referenced by at least one key, or retained by an open batch. */
  private readonly prefixes = new Map<string, PathPrefix>();
  /** Numeric slot radix for each indexed host. */
  private readonly slots = new Map<string, NumericPathIndex>();
  /** Empty prefixes to discard only after all destinations have been inserted. */
  private readonly pending = new Set<PathPrefix>();
  /** Nested batches defer prefix cleanup until the outer batch closes. */
  private batchDepth = 0;

  /** Add a new key using decoded paths; ancestors share cached prefix objects. */
  add(key: string, paths: readonly string[]): void {
    if (this.pathsByKey.has(key)) return;
    const own = paths.map((path) => this.getPrefix(path));
    this.pathsByKey.set(key, own);
    for (const prefix of own) {
      prefix.exact.add(key);
      let ancestor: PathPrefix | undefined = prefix;
      while (ancestor) {
        ancestor.keys.add(key);
        ancestor = ancestor.parent;
      }
    }
  }

  /** Remove one key without decoding its identity or re-slicing its ancestors. */
  delete(key: string): void {
    const paths = this.pathsByKey.get(key);
    if (!paths) return;
    this.pathsByKey.delete(key);
    for (const prefix of paths) {
      prefix.exact.delete(key);
      let ancestor: PathPrefix | undefined = prefix;
      while (ancestor) {
        ancestor.keys.delete(key);
        if (!ancestor.keys.size) {
          if (this.batchDepth) this.pending.add(ancestor);
          else this.dropPrefix(ancestor);
        }
        ancestor = ancestor.parent;
      }
    }
  }

  /** Retain emptied prefixes while chained destinations are assembled. */
  beginBatch(): void { this.batchDepth++; }

  /** Discard only prefixes still empty after the outer batch. */
  endBatch(): void {
    if (--this.batchDepth) return;
    for (const prefix of this.pending)
      if (!prefix.keys.size) this.dropPrefix(prefix);
    this.pending.clear();
  }

  /** Drop all indexed references. */
  clear(): void {
    this.pathsByKey.clear();
    this.prefixes.clear();
    this.slots.clear();
    this.pending.clear();
    this.batchDepth = 0;
  }

  /** Query subtree keys without visiting unrelated entries. */
  under(path: string): ReadonlySet<string> {
    return this.prefixes.get(path)?.keys ?? EMPTY_KEYS;
  }

  /** Query only indexed numeric positions at or beyond the supplied length. */
  tail(host: string, count: number): Iterable<string> {
    return this.slots.get(host)?.tail(count) ?? EMPTY_KEYS;
  }

  /** Include cached projections at every ancestor of an affected subtree. */
  intersecting(path: string): Set<string> {
    const keys = new Set(this.under(path));
    let ancestor = path;
    while (ancestor) {
      ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
      for (const key of this.prefixes.get(ancestor)?.exact ?? []) keys.add(key);
    }
    return keys;
  }

  /** Create only missing prefixes, starting at the nearest cached ancestor. */
  private getPrefix(path: string): PathPrefix {
    const held = this.prefixes.get(path);
    if (held) return held;
    const missing: string[] = [];
    let cursor = path;
    let parent = this.prefixes.get(cursor);
    while (!parent) {
      missing.push(cursor);
      if (!cursor) break;
      cursor = cursor.slice(0, cursor.lastIndexOf('/'));
      parent = this.prefixes.get(cursor);
    }
    for (let i = missing.length - 1; i >= 0; i--) {
      const current = missing[i];
      const segment = current.slice(current.lastIndexOf('/') + 1);
      const prefix: PathPrefix = { path: current, parent, segment,
        numeric: current !== '' && isCanonicalArraySlot(segment),
        keys: new Set(), exact: new Set() };
      this.prefixes.set(current, prefix);
      if (prefix.numeric && parent) {
        let slots = this.slots.get(parent.path);
        if (!slots) this.slots.set(parent.path, slots = new NumericPathIndex());
        slots.add(segment, current);
      }
      parent = prefix;
    }
    return parent!;
  }

  /** Release an unreferenced prefix and its numeric slot registration. */
  private dropPrefix(prefix: PathPrefix): void {
    this.prefixes.delete(prefix.path);
    if (!prefix.numeric || !prefix.parent) return;
    const slots = this.slots.get(prefix.parent.path);
    slots?.delete(prefix.segment);
    if (slots?.empty) this.slots.delete(prefix.parent.path);
  }
}

/** Shared empty lookup result, never mutated by consumers. */
const EMPTY_KEYS: ReadonlySet<string> = new Set();
