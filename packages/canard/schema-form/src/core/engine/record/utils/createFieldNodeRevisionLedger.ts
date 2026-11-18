import { EXTERNAL_VALUE_REVISION } from '@/schema-form/constants/externalValueRevision';

import { FieldNodeRevisionLedger } from './FieldNodeRevisionLedger';

/** Hidden binding counter, absent from public event-counter serialization. */
const EXTERNAL_REVISION_COUNT = Symbol();

/** An immutable binding extension is needed only after an external branch value changes. */
class ExternalValueRevisionLedger extends FieldNodeRevisionLedger {
  /** Counter carried by this committed binding snapshot. */
  declare private readonly [EXTERNAL_REVISION_COUNT]: number;

  /**
   * Preserve public counters and advance the binding counter only for its marked bit.
   * @param previous - Prior immutable ledger; missing binding counters start at zero.
   * @param mask - Public event bits and the internal external-value bit committed together.
   */
  constructor(previous: Readonly<Record<number, number>>, mask: number) {
    super(previous, mask);
    this[EXTERNAL_REVISION_COUNT] =
      (previous[EXTERNAL_VALUE_REVISION] ?? 0) +
      (mask & EXTERNAL_VALUE_REVISION ? 1 : 0);
  }

  /**
   * Read public counters and opt into the private binding counter explicitly.
   * @param mask - Selected public or binding revision bits.
   * @returns Their sum; unknown bits remain ignored by the base ledger.
   */
  override read(mask: number): number {
    return super.read(mask) +
      (mask & EXTERNAL_VALUE_REVISION ? this[EXTERNAL_REVISION_COUNT] : 0);
  }

  /** Binding counter for immutable continuation through later public-only commits. */
  get [EXTERNAL_VALUE_REVISION]() {
    return this[EXTERNAL_REVISION_COUNT];
  }
}

/**
 * Keep ordinary ledgers unchanged and preserve an admitted external-value counter.
 * @param previous - Last committed ledger, including the shared empty object.
 * @param mask - Revision bits committed together before delivery.
 * @returns A new immutable ledger, extended only when the binding counter is needed.
 */
export const createFieldNodeRevisionLedger = (
  previous: Readonly<Record<number, number>>,
  mask: number,
): FieldNodeRevisionLedger =>
  mask & EXTERNAL_VALUE_REVISION || previous instanceof ExternalValueRevisionLedger
    ? new ExternalValueRevisionLedger(previous, mask)
    : new FieldNodeRevisionLedger(previous, mask);
