/** A caller-visible refusal of a guard pointer that does not locate a schema. */
export class GuardPointerNotSchemaError extends Error {
  /** Error family shared with other caller-facing plugin failures. */
  readonly group = 'UNHANDLED_ERROR';
  /** Stable code for structural discrimination by consumers. */
  readonly code = 'GUARD_POINTER_NOT_SCHEMA';
  /** Authored root identifier and pointer that failed schema resolution. */
  readonly details: { root: string; pointer: string };

  /**
   * Records the root and pointer rejected by the guard compiler.
   * @param root - The authored root's string $id, or an empty string when absent.
   * @param pointer - The JSON Pointer that does not locate an object or boolean schema.
   */
  constructor(root: string, pointer: string) {
    super(`guard pointer does not locate a schema: ${pointer}`);
    this.name = 'GuardPointerNotSchemaError';
    this.details = { root, pointer };
  }
}
