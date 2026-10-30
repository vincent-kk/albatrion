import type { JSONSchema } from '@canard/schema-form';

/** Browser-only row configuration; schema variants retain equivalent fixture semantics. */
export interface InputFixture {
  /** Stable row name stored in raw evidence and reports. */
  id: string;
  /** Schema selected for the loaded lane. */
  schema: JSONSchema;
  /** JSONPointer of the string input, or branch discriminator. */
  target: string;
  /** Number of primitive input controls after complete mount. */
  expectedInputs: number;
  /** ValidationMode.OnChange when true; None otherwise. */
  validation: boolean;
  /** Parent counter update policy. */
  parentState?: 'plain' | 'transition';
  /** Mount with default virtualization options when true. */
  virtualization?: boolean;
  /** Mount rows report eager and complete reveal separately. */
  mount?: boolean;
  /** Approved non-burst validation probe; no keyboard.type delay option. */
  intervalMs?: number;
}
