import type { JSONSchema } from '@canard/schema-form';

/** One generated schema and its observable core browser operation. */
export interface CoreFixture {
  /** Stable identifier validated by the resolver's shape and operation rules. */
  id: string;
  /** Fresh canonical scale schema, with only operation-specific constraints. */
  schema: JSONSchema;
  /** Public field path used by the trusted keyboard driver. */
  target: string;
  /** Complete primitive control count required before a sample can finish. */
  expectedInputs: number;
  /** Measured public operation; first-key begins at the initial paint hook. */
  operation: 'mount' | 'type' | 'first-key' | 'rebuild';
  /** Enable the public OnChange validation mode. */
  validation: boolean;
  /** Omit validationMode for validated mounts to exercise the public default. */
  defaultValidation: boolean;
  /** Minimum spacing between real keyboard writes in nonburst rows. */
  intervalMs: number;
}
