import { JSONSchemaScanError } from '../error/JSONSchemaScanError';
import { JSONSchemaScanErrorCode } from '../error/JSONSchemaScanErrorCode';
import { applyOperations } from './applyOperations';
import type { OutputOperation } from './type';

/** Shared scan lifecycle and lazy output cache; both drivers delegate their getValue implementation here. */
export class ScanOutput {
  /** Current scan's operation ledger; an empty ledger is reused across scans. */
  public operations: OutputOperation[] = [];
  /** Input value remains caller-owned throughout scanning and output construction. */
  private original: unknown;
  /** Cached output is meaningful independently of its truthiness. */
  private value: unknown;
  /** Distinguishes a computed false or undefined result from an uncomputed one. */
  private computed = false;
  /** Same-instance access stays blocked across asynchronous callback suspension. */
  private running = false;

  /**
   * Begin a scan and clear old output.
   * @param schema Caller-owned root, including falsy values.
   * @returns Nothing; throws scan-in-progress before changing an already running scan.
   */
  public begin(schema: unknown): void {
    if (this.running)
      throw new JSONSchemaScanError(
        JSONSchemaScanErrorCode.ScanInProgress,
        'A scan is already in progress on this instance',
      );
    this.original = schema;
    if (this.computed) {
      this.value = undefined;
      this.computed = false;
    }
    if (this.operations.length > 0) this.operations = [];
    this.running = true;
  }

  /** Release the running guard after successful traversal; returns nothing and retains the output ledger. */
  public finish(): void {
    this.running = false;
  }

  /** Clear all output and lifecycle state after a failed scan; returns nothing. */
  public reset(): void {
    this.original = undefined;
    this.value = undefined;
    this.computed = false;
    this.operations = [];
    this.running = false;
  }

  /**
   * Calculate output once and discard the applied ledger.
   * @returns The cached value by identity, including false or undefined before any scan.
   * @throws scan-in-progress during traversal; failed copies remain uncomputed.
   */
  public getValue(): unknown {
    if (this.running)
      throw new JSONSchemaScanError(
        JSONSchemaScanErrorCode.ScanInProgress,
        'Output is unavailable while scanning this instance',
      );
    if (!this.computed) {
      this.value = applyOperations(this.original, this.operations);
      this.operations = [];
      this.computed = true;
    }
    return this.value;
  }
}
