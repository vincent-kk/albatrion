import type { FieldNodeWriteKind } from '../../types/value';

/** One address decision in the order in which caller inputs are applied. */
export interface WriteRange {
  /** Canonical physical address, or the logical source of a virtual input. */
  path: string;
  /** Origin used for explicit input and delivery tracking. */
  source: FieldNodeWriteKind;
  /** The observed partial input at this address, used for refused-reset replay. */
  partial?: Record<string, unknown>;
  /** Physical constituent covered by a virtual whole write. */
  isIndirect?: true;
  /** Logical provenance of a virtual write, without physical coverage. */
  isLogical?: true;
}
