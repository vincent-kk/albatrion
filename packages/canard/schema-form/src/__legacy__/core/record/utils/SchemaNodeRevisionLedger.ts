import { SchemaNodeEventType } from '../SchemaNodeEventType';

/** Known event bits occupy consecutive slots rather than sparse numeric elements. */
const KNOWN_BITS = (SchemaNodeEventType.UpdateDiagnostics << 1) - 1;

/** Immutable per-bit counters with compatibility accessors for direct bit reads. */
export class SchemaNodeRevisionLedger {
  /** Numeric bit reads remain part of the internal record contract. */
  readonly [bit: number]: number;
  /** A copy belongs exclusively to this ledger; old readers keep their counters. */
  private readonly counts: readonly number[];

  /**
   * Copy the previous counters and raise each marked known bit once.
   * @param previous - Last committed ledger, including the shared empty object
   * @param mask - Delivery bits committed together before listener invocation
   */
  constructor(previous: Readonly<Record<number, number>>, mask: number) {
    const counts = previous instanceof SchemaNodeRevisionLedger ? previous.counts.slice() :
      Array.from({ length: 17 }, (_, index) => previous[1 << index]);
    let remaining = mask & KNOWN_BITS;
    while (remaining) {
      const bit = remaining & -remaining;
      const index = 31 - Math.clz32(bit);
      counts[index] = (counts[index] ?? 0) + 1;
      remaining &= remaining - 1;
    }
    this.counts = counts;
  }

  /**
   * Sum selected known counters without sparse bit-key lookups.
   * @param mask - Event bits requested by revision(mask)
   * @returns Sum with unknown bits ignored
   */
  read(mask: number): number {
    let revision = 0;
    let remaining = mask & KNOWN_BITS;
    while (remaining) {
      const bit = remaining & -remaining;
      revision += this.counts[31 - Math.clz32(bit)] ?? 0;
      remaining &= remaining - 1;
    }
    return revision;
  }

  /** Initialization counter. */
  get [SchemaNodeEventType.Initialized]() { return this.counts[0]; }
  /** Path counter. */
  get [SchemaNodeEventType.UpdatePath]() { return this.counts[1]; }
  /** Value counter. */
  get [SchemaNodeEventType.UpdateValue]() { return this.counts[2]; }
  /** Interaction counter. */
  get [SchemaNodeEventType.UpdateState]() { return this.counts[3]; }
  /** Global interaction counter. */
  get [SchemaNodeEventType.UpdateGlobalState]() { return this.counts[4]; }
  /** Validation counter. */
  get [SchemaNodeEventType.UpdateError]() { return this.counts[5]; }
  /** Aggregate validation counter. */
  get [SchemaNodeEventType.UpdateGlobalError]() { return this.counts[6]; }
  /** Child shape counter. */
  get [SchemaNodeEventType.UpdateChildren]() { return this.counts[7]; }
  /** Computed state counter. */
  get [SchemaNodeEventType.UpdateComputedProperties]() { return this.counts[8]; }
  /** Focus entry counter. */
  get [SchemaNodeEventType.Focused]() { return this.counts[9]; }
  /** Focus exit counter. */
  get [SchemaNodeEventType.Blurred]() { return this.counts[10]; }
  /** Focus request counter. */
  get [SchemaNodeEventType.RequestFocus]() { return this.counts[11]; }
  /** Selection request counter. */
  get [SchemaNodeEventType.RequestSelect]() { return this.counts[12]; }
  /** Refresh request counter. */
  get [SchemaNodeEventType.RequestRefresh]() { return this.counts[13]; }
  /** Remount request counter. */
  get [SchemaNodeEventType.RequestRemount]() { return this.counts[14]; }
  /** Effective schema counter. */
  get [SchemaNodeEventType.UpdateJsonSchema]() { return this.counts[15]; }
  /** Settlement diagnostics counter. */
  get [SchemaNodeEventType.UpdateDiagnostics]() { return this.counts[16]; }
}
