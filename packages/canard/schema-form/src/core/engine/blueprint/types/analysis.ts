import type { Dictionary, Optional } from '@aileron/declare';

import type { Blueprint, BlueprintOptions } from './blueprint';
import type {
  BlueprintChildEntry,
  BlueprintGate,
  BlueprintNode,
  PropertyDeclaration,
  SchemaFragment,
} from './node';
import type { BlueprintSchema } from './schema';

/** Writable construction view; public arrays and records are frozen at publication. */
export type MutableNode = {
  -readonly [Key in keyof Omit<
    BlueprintNode,
    'childEntries'
  >]: BlueprintNode[Key];
} & { childEntries: BlueprintChildEntry[] };
/** Writable fragment ownership lists during one analysis. */
export type MutableFragment = Omit<
  SchemaFragment,
  'declares' | 'overlays' | 'inheritedOverlays' | 'children'
> & {
  declares: number[];
  overlays: number[];
  inheritedOverlays: number[];
  children: number[];
};
/** One authored schema contribution before fragment expansion. */
export interface SchemaInput {
  schema: BlueprintSchema;
  schemaPath: string;
  context: PropertyDeclaration['context'];
  gates: readonly BlueprintGate[];
  order: readonly number[];
  role: PropertyDeclaration['role'];
  inherited: boolean;
  hostPath: string;
  fragment?: MutableFragment;
  isFragment?: boolean;
}
/** State owned by one invocation, never process-global or reused across roots. */
export interface AnalysisContext {
  /** Monotonic declaration evidence requiring child-target validation; never published. */
  hasChildTargets: boolean;
  /** Authored inactiveValue presence; absent graphs skip resolver metadata preparation. */
  hasInactiveValues?: true;
  /** Literal/default and finite-shape evidence, independent of branchless evidence. */
  staticFirstLoad: boolean;
  /** Monotonic evidence that construction hit a template still being built. */
  hasTemplateRecursion: boolean;
  /** Monotonic feature evidence collected together with authored declarations. */
  capabilities: { -readonly [Key in keyof Blueprint['capabilities']]: boolean };
  schema: BlueprintSchema;
  options: BlueprintOptions;
  nodes: MutableNode[];
  fragments: MutableFragment[];
  declarationId: number;
  declarationOwners: Optional<Map<number, number>>;
  templates: Map<string, MutableNode[]>;
  constructing: Map<string, MutableNode[]>;
  /** Index, in its template's construction inputs, of the input each declaration was collected from. */
  declarationInputs: Map<number, number>;
  /** Authored branch locations converted into explicit discriminator gates. */
  discriminatorBranches?: Set<string>;
  dependencies: Optional<Dictionary<number[]>>;
}
