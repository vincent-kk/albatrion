import type {
  Blueprint,
  BlueprintGate,
  BlueprintNode,
  BlueprintOptions,
  BlueprintSchema,
  PropertyDeclaration,
  SchemaFragment,
} from '../../type';

/** Writable construction view; public arrays and records are frozen at publication. */
export type MutableNode = {
  -readonly [Key in keyof BlueprintNode]: BlueprintNode[Key];
};
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
  /** Literal/default and finite-shape evidence, independent of branchless evidence. */
  staticFirstLoad: boolean;
  /** Monotonic feature evidence collected together with authored declarations. */
  capabilities: { -readonly [Key in keyof Blueprint['capabilities']]: boolean };
  schema: BlueprintSchema;
  options: BlueprintOptions;
  nodes: MutableNode[];
  fragments: MutableFragment[];
  declarationId: number;
  declarationOwners: Map<number, number> | undefined;
  templates: Map<string, MutableNode[]>;
  constructing: Map<string, MutableNode[]>;
  /** Authored branch locations converted into explicit discriminator gates. */
  discriminatorBranches?: Set<string>;
  dependencies: Record<string, number[]> | undefined;
}
