import type {
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintNodeKind,
  SchemaTypeName,
} from '../../blueprint';
import type { NodeStrategy } from '../../types/strategy';
import type { FieldNodeRecord } from './record';
import type { FieldNodeRuntime } from './runtime';

/** Read-only type candidates used by a calculation row. */
export interface UnionSpec {
  /** Non-null allowed types in declaration order. */
  readonly kinds:
    | Exclude<SchemaTypeName, 'null'>
    | readonly Exclude<SchemaTypeName, 'null'>[];
  /** Bit mask of the same allowed types. */
  readonly mask: number;
  /** Whether null remains an allowed input. */
  readonly nullable: boolean;
}

/** Caller verb represented without changing a node or its children. */
export type ArrayOperation =
  | { kind: 'push'; value: unknown }
  | { kind: 'pop' }
  | { kind: 'update'; index: number; value: unknown }
  | { kind: 'remove'; index: number }
  | { kind: 'clear' };

/** Where settlement obtains the synchronous result of an array verb. */
export type ArrayArrangeResult =
  | { source: 'length' }
  | { source: 'removed'; index: number }
  | { source: 'updated'; index: number }
  | { source: 'void' };

/** Pure structural proposal for a branch or a whole-value terminal array. */
export type ArrayArrangePlan =
  | { kind: 'noop' }
  | {
      kind: 'slots';
      slots: readonly ({ from: number } | { value: unknown })[];
      result: ArrayArrangeResult;
    }
  | { kind: 'update'; index: number; value: unknown }
  | { kind: 'raw'; raw: readonly unknown[]; result: ArrayArrangeResult };

/** Pure calculation slots shared across nodes of one kind and strategy. */
export interface Behavior<Self = unknown> {
  /** Interpret caller input under the current allowed types. */
  interpret(input: unknown, spec: UnionSpec): unknown;
  /** Assemble the current child values without committing them. */
  assemble<Node extends Self>(
    node: FieldNodeRecord<Node>,
    children: readonly Node[],
    recalculated?: readonly Node[],
    hint?: { incremental: boolean },
  ): unknown;
  /** Project a local value into the outgoing value. */
  project<Node extends Self>(
    node: FieldNodeRecord<Node>,
    local: unknown,
  ): unknown;
  /** Return a completed input string, or undefined when there is no write. */
  finishInput<Node extends Self>(
    node: FieldNodeRecord<Node>,
  ): string | undefined;
  /** Describe children to be created by the caller. */
  declareChildren<Node extends Self>(
    node: FieldNodeRecord<Node>,
  ): readonly BlueprintChildEntry[];
  /** Propose an array verb without writing source, shape, or notifications. */
  arrange<Node extends Self>(
    node: FieldNodeRecord<Node>,
    operation: ArrayOperation,
  ): ArrayArrangePlan;
  /** Stable dispatch kind of this row. */
  readonly type: BlueprintNodeKind;
  /** Fixed branch or terminal shape of this row. */
  readonly strategy: NodeStrategy;
}

/** Per-tree creation callback supplied by the composition root. */
export type FieldNodeFactory<Self> = (
  entry: BlueprintChildEntry | BlueprintNode,
  parent: Self | null,
  runtime: FieldNodeRuntime<Self>,
) => Self;
