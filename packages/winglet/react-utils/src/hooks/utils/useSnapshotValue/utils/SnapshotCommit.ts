import type { RefObject } from 'react';

/** Snapshot and comparison data belong to one committed render. */
type SnapshotRecord<Input> = { value: Input; omit: Set<keyof Input> | undefined | null };

/** Owns one publication target so the shared commit helper publishes snapshot and metadata together. */
export class SnapshotCommit<Input> {
  private __current__: SnapshotRecord<Input>;
  /** Public snapshot storage retains its ordinary writable ref shape. */
  private readonly __reference__: RefObject<Input>;

  /** Initialize the owned comparison frame without publishing outside the mounting render. */
  constructor(reference: RefObject<Input>, input: Input) {
    this.__reference__ = reference;
    this.__current__ = { value: input, omit: null };
  }

  /** Last committed comparison and snapshot. */
  get current(): SnapshotRecord<Input> { return this.__current__; }
  /** Publish both parts from the same commit effect. */
  set current(value: SnapshotRecord<Input>) {
    this.__current__ = value;
    this.__reference__.current = value.value;
  }
}
