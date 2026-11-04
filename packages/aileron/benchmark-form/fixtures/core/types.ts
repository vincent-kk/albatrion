import type { JSONSchema } from '@canard/schema-form';

/** One generated schema and its observable core browser operation. */
export interface CoreFixture {
  /** Stable identifier validated by the resolver's shape and operation rules. */
  id: string;
  /** Fresh canonical scale schema, with only operation-specific constraints and the probe leaf for validated cases. */
  schema: JSONSchema;
  /** Public field path used by the trusted keyboard driver. */
  target: string;
  /** Public path whose marker is observed: the typed leaf, the probe leaf for validated loads, null for none. */
  measuredPath: string | null;
  /** Complete primitive control count required before a sample can finish. */
  expectedInputs: number;
  /** Measured public operation; first-key is driven from the initial paint hook, after any case-specific load wait. */
  operation: 'mount' | 'type' | 'first-key' | 'rebuild';
  /** Enable the public OnChange validation mode. */
  validation: boolean;
  /** Omit validationMode for validated mounts to exercise the public default. */
  defaultValidation: boolean;
  /** Minimum spacing between real keyboard writes in nonburst rows. */
  intervalMs: number;
}
