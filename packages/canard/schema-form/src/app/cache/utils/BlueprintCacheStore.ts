import type { BlueprintCacheEntries, CacheDomain } from '../type';

/** WeakMap-compatible adapter preserving the immutable domain entry-list contract. */
export class BlueprintCacheStore extends WeakMap<
  object,
  BlueprintCacheEntries
> {
  constructor(
    private readonly domain: CacheDomain<object, BlueprintCacheEntries>,
  ) {
    super();
  }

  /** Read the current predicate variants without building on a miss. */
  override get(key: object): BlueprintCacheEntries | undefined {
    return this.domain.peek(key)?.value;
  }

  /** Replace list membership; core never appends to a resolved domain value. */
  override set(key: object, value: BlueprintCacheEntries): this {
    this.domain.invalidate(key);
    this.domain.resolve(key, () => value);
    return this;
  }

  /** Remove future reuse while retaining already resolved blueprints. */
  override delete(key: object): boolean {
    return this.domain.invalidate(key);
  }

  /** Check key ownership in the delegated domain rather than the empty native map. */
  override has(key: object): boolean {
    return this.domain.peek(key) !== undefined;
  }
}
