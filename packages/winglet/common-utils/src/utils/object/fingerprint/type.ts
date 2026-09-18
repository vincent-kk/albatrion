/** Key generation policy selected once when constructing a factory. */
export type FingerprintMode = 'fast' | 'sorted' | 'safe';

/** Property exclusions and an optional caller-controlled output prefix. */
export interface FingerprintOptions {
  /** Excluded property names; fast mode applies these only at the root. */
  omit?: readonly string[] | ReadonlySet<string>;
  /** Prepended verbatim, empty by default. */
  prefix?: string;
}

/** Cycle-safe key options; sorting can be skipped when insertion order is meaningful. */
export interface SafeFingerprintOptions extends FingerprintOptions {
  /** Defaults to true, matching stableSerialize; false preserves property insertion order. */
  sort?: boolean;
}

/** Factory-lifetime policy for algorithm selection, prefix and optional caching. */
interface FactoryPolicy {
  /** Defaults to none; immutable requires a deeply immutable input graph. */
  cache?: 'none' | 'immutable';
  /** Captured at construction, empty by default. */
  prefix?: string;
}

/** Sorting is configurable for safe mode; sorted mode always sorts its paths. */
export type FingerprintFactoryOptions = FactoryPolicy &
  (
    | { mode?: 'safe'; sort?: boolean }
    | { mode: 'fast' | 'sorted'; sort?: never }
  );

/** Generates keys in one identity/cache scope with per-call property exclusions. */
export type FingerprintGenerator = (
  value: unknown,
  options?: Pick<FingerprintOptions, 'omit'>,
) => string;
