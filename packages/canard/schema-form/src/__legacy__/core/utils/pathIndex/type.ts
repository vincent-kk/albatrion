/** Serialized identity format used by one path-keyed runtime store. */
export type PathKeyMode = 'path' | 'pair' | 'rule';

/** One translated entry; absent key means its occurrence perished. */
export interface PathKeyedMove<Value> {
  /** Existing identity removed before any destination is written. */
  previous: string;
  /** Surviving serialized identity, absent for removal. */
  key?: string;
  /** Existing value or transformed metadata; undefined may be a valid value. */
  value: Value;
  /** Decoded destination paths, so a batch does not parse its keys again. */
  paths: readonly string[];
}
