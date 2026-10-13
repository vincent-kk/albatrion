import { FieldNodeEventType } from '../constants/FieldNodeEventType';
import { EMPTY_REVISION_LEDGER } from '../constants/emptyRevisionLedger';

/** Known event bits occupy consecutive slots rather than sparse numeric elements. */
const KNOWN_BITS = (FieldNodeEventType.UpdateDiagnostics << 1) - 1;

/** Immutable per-bit counters with compatibility accessors for direct bit reads. */
export class FieldNodeRevisionLedger {
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
    // The shared empty ledger has no counters, so a first delivery starts empty.
    const counts: number[] =
      previous === EMPTY_REVISION_LEDGER
        ? []
        : previous instanceof FieldNodeRevisionLedger
          ? previous.counts.slice()
          : Array.from({ length: 17 }, (_, index) => previous[1 << index]);
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
  get [FieldNodeEventType.Initialized]() {
    return this.counts[0];
  }
  /** Path counter. */
  get [FieldNodeEventType.UpdatePath]() {
    return this.counts[1];
  }
  /** Value counter. */
  get [FieldNodeEventType.UpdateValue]() {
    return this.counts[2];
  }
  /** Interaction counter. */
  get [FieldNodeEventType.UpdateState]() {
    return this.counts[3];
  }
  /** Global interaction counter. */
  get [FieldNodeEventType.UpdateGlobalState]() {
    return this.counts[4];
  }
  /** Validation counter. */
  get [FieldNodeEventType.UpdateError]() {
    return this.counts[5];
  }
  /** Aggregate validation counter. */
  get [FieldNodeEventType.UpdateGlobalError]() {
    return this.counts[6];
  }
  /** Child shape counter. */
  get [FieldNodeEventType.UpdateChildren]() {
    return this.counts[7];
  }
  /** Computed state counter. */
  get [FieldNodeEventType.UpdateControlledProperties]() {
    return this.counts[8];
  }
  /** Focus entry counter. */
  get [FieldNodeEventType.Focused]() {
    return this.counts[9];
  }
  /** Focus exit counter. */
  get [FieldNodeEventType.Blurred]() {
    return this.counts[10];
  }
  /** Focus request counter. */
  get [FieldNodeEventType.RequestFocus]() {
    return this.counts[11];
  }
  /** Selection request counter. */
  get [FieldNodeEventType.RequestSelect]() {
    return this.counts[12];
  }
  /** Refresh request counter. */
  get [FieldNodeEventType.RequestRefresh]() {
    return this.counts[13];
  }
  /** Remount request counter. */
  get [FieldNodeEventType.RequestRemount]() {
    return this.counts[14];
  }
  /** Effective schema counter. */
  get [FieldNodeEventType.UpdateJsonSchema]() {
    return this.counts[15];
  }
  /** Settlement diagnostics counter. */
  get [FieldNodeEventType.UpdateDiagnostics]() {
    return this.counts[16];
  }
}
