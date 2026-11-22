/** One checked source snapshot shared by hashing, validation and every agent. */
export interface SourceSnapshot {
  /** Unchanged file bytes used by standalone copies. */
  readonly bytes: Buffer;
  /** Original permission bits used when creating a destination. */
  readonly mode: number;
  /** Normalized Latin-1 byte view used by embedded blocks. */
  readonly body: string;
  /** SHA-256 hexadecimal digest of the normalized body bytes. */
  readonly bodyHash: string;
  /** SHA-256 hexadecimal digest of the unchanged source bytes. */
  readonly rawHash: string;
}
