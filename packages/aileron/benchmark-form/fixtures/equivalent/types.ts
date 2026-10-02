import type { JSONSchema } from '@canard/schema-form';

export type Interaction =
  | { kind: 'set'; path: string; value: unknown }
  | { kind: 'push'; path: string; value: unknown }
  | { kind: 'remove'; path: string; index: number };

export interface EquivalentFixture {
  name: string;
  legacy: JSONSchema;
  workspace: JSONSchema;
  interactions: Interaction[];
}

export interface BenchNode {
  value: unknown;
  setValue(value: unknown): void;
  push(value: unknown): void;
  remove(index: number): void;
}

export interface BenchHandle {
  findNode(path: string): BenchNode | null;
  getValue(): unknown;
}
