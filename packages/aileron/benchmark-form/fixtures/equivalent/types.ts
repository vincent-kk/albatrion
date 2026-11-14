import type { FieldNode, FormHandle, JSONSchema } from '@canard/schema-form';
import type {
  FormHandle as FormHandle0160,
  JSONSchema as JSONSchema0160,
} from '@canard/schema-form_0.16.0';
import type {
  FormHandle as FormHandle0161,
  JSONSchema as JSONSchema0161,
} from '@canard/schema-form_0.16.1';

export type Interaction =
  | { kind: 'set'; path: string; value: unknown }
  | { kind: 'push'; path: string; value: unknown }
  | { kind: 'remove'; path: string; index: number };

/** Schema syntax checked by every compared public Form implementation. */
export type EquivalentJSONSchema = JSONSchema & JSONSchema0160 & JSONSchema0161;

export interface EquivalentFixture {
  name: string;
  /** Starting array size, distinct from the number of items added by interactions. */
  initialItems?: number;
  legacy: EquivalentJSONSchema;
  workspace: JSONSchema;
  interactions: Interaction[];
}

/** Public node operations whose results are ignored by authored interactions. */
type BenchNode = Pick<FieldNode, 'value'> & {
  /** Writes one value with each version's default update options. */
  setValue(
    value: Parameters<FieldNode['setValue']>[0],
  ): ReturnType<FieldNode['setValue']>;
} &
  (
    | {
        /** Only array nodes expose structural edits. */
        type: 'array';
        /** Adds an item; synchronous and asynchronous results are both ignored. */
        push(value: unknown): unknown;
        /** Removes an item; synchronous and asynchronous results are both ignored. */
        remove(index: number): unknown;
      }
    | {
        /** Non-array nodes support value writes without structural edits. */
        type: Exclude<FieldNode['type'], 'array'>;
      }
  );

/** Public handle operations exercised identically across the compared versions. */
export interface BenchHandle {
  /** Finds a public node while preserving array-only operations. */
  findNode(path: string): BenchNode | null;
  /** Reads the form value using the selected version's public getter. */
  getValue: (FormHandle | FormHandle0160 | FormHandle0161)['getValue'];
}
