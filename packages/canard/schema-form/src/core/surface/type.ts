import type {
  Dictionary,
  Nullable as NullableValue,
  Nullish,
  Optional,
} from '@aileron/declare';

import type { BlueprintSchema, NodeStrategy, SchemaTypeName } from '../engine';
import type { InactiveValueResolver } from '../engine';
import type { FieldNodeListener } from '../engine';
import type { FieldNodeRuntime } from '../engine';
import type { FieldNodeEventType, FieldNodeRequestType } from '../engine';
import type { NodeStateFlags } from '../engine';
import { WriteOption } from '../engine';
import type { ValidationIssue } from '../engine';

/** The four caller-facing flags understood by the first settlement engine. */
export const SetValueOption: Readonly<
  Pick<
    typeof WriteOption,
    'Overwrite' | 'Merge' | 'DisableAutomaticWrites' | 'EnableAutomaticWrites'
  >
> = Object.freeze({
  Overwrite: WriteOption.Overwrite,
  Merge: WriteOption.Merge,
  DisableAutomaticWrites: WriteOption.DisableAutomaticWrites,
  EnableAutomaticWrites: WriteOption.EnableAutomaticWrites,
});
export type SetValueOption =
  (typeof SetValueOption)[keyof typeof SetValueOption];

export type UnionMemberType = Exclude<SchemaTypeName, 'null'>;
export type UnionSchemaType = readonly [
  UnionMemberType,
  UnionMemberType,
  ...UnionMemberType[],
];
export type NodeDiagnostics = FieldNodeRuntime<unknown>['diagnostics'];
export type InactiveValue = Readonly<{ path: string; value: unknown }>;

/** Value admitted by one static JSON kind, before schema validation. */
export type ValueForKind<Kind extends UnionMemberType> = Kind extends 'string'
  ? string
  : Kind extends 'number' | 'integer'
    ? number
    : Kind extends 'boolean'
      ? boolean
      : Kind extends 'object'
        ? Dictionary<unknown>
        : Kind extends 'array'
          ? readonly unknown[]
          : never;

/** Shared PR-2 surface; record storage remains behind the runtime class. */
export interface NodeSurface<
  Kind extends string,
  Strategy extends NodeStrategy,
  SchemaType,
  Value,
  Children,
  Nullable extends boolean = boolean,
> {
  readonly type: Kind;
  readonly strategy: Strategy;
  readonly schemaType: SchemaType;
  readonly jsonSchema: BlueprintSchema;
  /** Whether the effective declaration requires this occurrence. */
  readonly isRequired: boolean;
  readonly nullable: Nullable;
  readonly depth: number;
  readonly isRoot: boolean;
  readonly rootNode: FieldNode;
  readonly parentNode: NullableValue<FieldNode>;
  readonly name: string;
  readonly escapedName: string;
  readonly path: string;
  readonly children: Children;
  /** Interpreted terminal source or a branch's non-plain source. */
  readonly raw: unknown;
  /** Undeclared object keys retained in incoming own-key order. */
  readonly undeclaredValues: unknown;
  readonly value: Value;
  readonly outputValue: unknown;
  readonly inactiveValues: readonly InactiveValue[];
  /** Whether this occurrence remains in the current shape. */
  readonly isActive: boolean;
  /** Local visibility after all active declarations are combined. */
  /** Local visibility after active declarations are combined. */
  readonly isVisible: boolean;
  /** A node is enabled when it remains active and visible. */
  /** Whether this occurrence is active and visible, independent of disabled state. */
  readonly isPresent: boolean;
  /** Local read-only state, including standard schema readOnly. */
  /** Local read-only state including the standard schema readOnly flag. */
  readonly isReadOnly: boolean;
  /** Local disabled state, independent of enabled. */
  /** Local input lock independent of presence. */
  readonly isDisabled: boolean;
  /** Effective watched values read from the emitted tree. */
  readonly watchValues: readonly unknown[];
  /** Shared context reference supplied by the current Form binding. */
  readonly context: Readonly<Dictionary<unknown>>;
  /** Whether the retained raw value misses the effective accepted types. */
  readonly isMisfit: boolean;
  readonly misfits: readonly string[];
  readonly diagnostics: NodeDiagnostics;
  readonly defaultValue: unknown;
  /** User-input state truthiness; React consumers re-read on UpdateState. */
  readonly isEdited: boolean;
  /** Blur state truthiness; React consumers re-read on UpdateState. */
  readonly isTouched: boolean;
  /**
   * Whether current form output differs from the last root load at this path.
   * False before the first load and after detach. Array positions and key order matter.
   * React consumers re-read on UpdateValue, UpdatePath or UpdateState.
   */
  readonly isDivergent: boolean;
  find(
    pointer?: NullableValue<string | readonly string[]>,
  ): NullableValue<FieldNode>;
  findNodes(
    pointer?: NullableValue<string | readonly string[]>,
  ): readonly FieldNode[];
  /**
   * Call `visitor` on this node and then its descendants in preorder, siblings in order.
   * From a live node only nodes in the current shape are visited; from a detached node, the
   * subtree it was detached with. Terminals are leaves, a node reached twice through a reference
   * is visited once, and nodes created during the walk may be missed. Returning `false` skips
   * that node's descendants. The walk batches like `batch`: value writes are marked and settle
   * once when it ends, so value reads during the walk see the last committed values; state and
   * external-error changes apply at once while their events wait; a form reset and
   * `resetSubtree()` still settle their load at once. Inside an enclosing batch, everything waits
   * for that batch's end instead.
   */
  visitSubtree(visitor: (node: FieldNode) => void | boolean): void;
  setValue(value: unknown, option?: SetValueOption): void;
  resetSubtree(option?: SetValueOption): void;
  /** Local interaction flags, patched through the dispatcher on assignment. */
  state: NodeStateFlags;
  /** Patch this occurrence's interaction flags. */
  setState(state: NodeStateFlags): void;
  /**
   * Interaction flags present on at least one node in the current tree shape.
   * Published values are `true` or absent; `false` is never emitted, and the
   * type admits `boolean | undefined` so consumers may keep a wider copy.
   */
  readonly globalState: Readonly<Dictionary<Optional<boolean>>>;
  /** Patch interaction flags throughout this live subtree. */
  setSubtreeState(state: NodeStateFlags): void;
  /** Clear interaction flags throughout this live subtree. */
  clearSubtreeState(): void;
  /** Displayed validator and external issues for this occurrence. */
  readonly errors: readonly ValidationIssue[];
  /** Ordered whole-tree validator issues. */
  readonly globalErrors: readonly ValidationIssue[];
  /** Replace this occurrence's external issues; a non-root write also replaces the root list's issues at this path. */
  setExternalErrors(errors: readonly ValidationIssue[]): void;
  /** Clear this occurrence's external issues; a non-root clear also removes the root list's issues at this path. */
  clearExternalErrors(): void;
  /** Request a fresh whole-schema validation verdict. */
  validate(): Promise<readonly ValidationIssue[]>;
  /** Subscribe to future event deliveries. */
  subscribe(listener: FieldNodeListener): () => void;
  /** Resolve the retained value synchronously at this instance's normal keep-policy gate exit; returns cleanup. */
  onInactive(listener: InactiveValueResolver<unknown>): () => void;
  /** Read the accumulated delivery revision for selected event bits. */
  revision(mask?: FieldNodeEventType): number;
  /** Request one renderer action. */
  request(kind: FieldNodeRequestType): void;
  /**
   * Group synchronous writes in one outer delivery boundary.
   * Array verbs (`push`, `pop`, `update`, `remove`, `insert`, `clear`) also compute their
   * array at the call site on top of prior marks, return the synchronous result
   * and mark the resulting array. Settlement at the end of the batch is a whole
   * write, so item keys carry over by position.
   */
  batch(fn: () => void): void;
}

export type StringNode = NodeSurface<
  'string',
  'terminal',
  'string',
  Optional<NullableValue<string>>,
  null
>;
export type NumberNode = NodeSurface<
  'number',
  'terminal',
  'number' | 'integer',
  Optional<NullableValue<number>>,
  null
>;
export type BooleanNode = NodeSurface<
  'boolean',
  'terminal',
  'boolean',
  Optional<NullableValue<boolean>>,
  null
>;
export type NullNode = NodeSurface<'null', 'terminal', 'null', Nullish, null>;
export type ObjectNode =
  | NodeSurface<
      'object',
      'branch',
      'object',
      Optional<NullableValue<Dictionary<unknown>>>,
      readonly FieldNode[]
    >
  | NodeSurface<
      'object',
      'terminal',
      'object',
      Optional<NullableValue<Dictionary<unknown>>>,
      null
    >;
/** Structural edits shared by branch and terminal array nodes. */
interface ArrayNodeMethods<Item> {
  /** Append one caller value and return the new length synchronously. */
  push(value?: Item): number;
  /** Remove the final position and return its last committed value. */
  pop(): Optional<Item>;
  /** Replace one position without changing its snapshot or identity. */
  update(index: number, value: Item): Optional<Item>;
  /** Remove one position and return its last committed value. */
  remove(index: number): Optional<Item>;
  /**
   * Insert one caller value at a position in [0, length] and return the new length synchronously.
   * Items at and after `index` keep their nodes and keys and move one position back; `index` equal
   * to the length appends exactly like `push`. A negative, fractional or larger index changes
   * nothing and returns the current length. A host holding a non-array value becomes `[value]` at
   * index 0, like `push`, and ignores any other index. `minItems` and `maxItems` are not enforced.
   * @param index - Integer position in [0, length]
   * @param value - Value of the new item; omitted or undefined lets the new item fill its defaults
   * @returns Array length after the call
   */
  insert(index: number, value?: Item): number;
  /** Remove every position without returning an item. */
  clear(): void;
}

export type ArrayNode<Item = unknown> =
  | (NodeSurface<
      'array',
      'branch',
      'array',
      Optional<NullableValue<readonly Item[]>>,
      readonly FieldNode[]
    > &
      ArrayNodeMethods<Item>)
  | (NodeSurface<
      'array',
      'terminal',
      'array',
      Optional<NullableValue<readonly Item[]>>,
      null
    > &
      ArrayNodeMethods<Item>);
export type VirtualNode = NodeSurface<
  'virtual',
  'branch',
  undefined,
  Optional<readonly unknown[]>,
  readonly FieldNode[]
>;

export type UnionNode<
  Types extends UnionSchemaType = UnionSchemaType,
  Nullable extends boolean = boolean,
> =
  | (NodeSurface<
      'union',
      'terminal',
      Types,
      Optional<
        ValueForKind<Types[number]> | (Nullable extends true ? null : never)
      >,
      null,
      Nullable
    > & {
      /** The raw value matches an accepted union member. */
      readonly isMisfit: false;
    })
  | (NodeSurface<'union', 'terminal', Types, unknown, null, Nullable> & {
      /** The retained raw value lies outside the accepted union members. */
      readonly isMisfit: true;
    });

/** Union input sees the misfit lamp without accepting a misfitting write. */
export type FieldNodeInputProps<
  Types extends UnionSchemaType = UnionSchemaType,
  Nullable extends boolean = boolean,
> =
  | {
      readonly misfit: false;
      readonly value: Optional<
        ValueForKind<Types[number]> | (Nullable extends true ? null : never)
      >;
      readonly onChange: (
        value: Optional<
          ValueForKind<Types[number]> | (Nullable extends true ? null : never)
        >,
      ) => void;
    }
  | {
      readonly misfit: true;
      readonly value: unknown;
      readonly onChange: (
        value: Optional<
          ValueForKind<Types[number]> | (Nullable extends true ? null : never)
        >,
      ) => void;
    };

/** Public type discrimination is independent of the single runtime class. */
export type FieldNode =
  | StringNode
  | NumberNode
  | BooleanNode
  | NullNode
  | ObjectNode
  | ArrayNode
  | VirtualNode
  | UnionNode;
export type BranchNode = Extract<FieldNode, { strategy: 'branch' }>;
export type TerminalNode = Exclude<FieldNode, BranchNode>;

type LiteralKind<Value> = Value extends string
  ? 'string'
  : Value extends number
    ? 'number'
    : Value extends boolean
      ? 'boolean'
      : Value extends null
        ? 'null'
        : Value extends readonly unknown[]
          ? 'array'
          : Value extends Dictionary<unknown>
            ? 'object'
            : never;
type KindNode<Kind> = Kind extends 'string'
  ? StringNode
  : Kind extends 'number' | 'integer'
    ? NumberNode
    : Kind extends 'boolean'
      ? BooleanNode
      : Kind extends 'null'
        ? NullNode
        : Kind extends 'object'
          ? ObjectNode
          : Kind extends 'array'
            ? ArrayNode
            : Kind extends 'virtual'
              ? VirtualNode
              : never;
type NonNullKinds<Type> = Exclude<Type, 'null'>;
type OneKind<Kind> = [Kind] extends [never]
  ? never
  : [Kind] extends ['number' | 'integer']
    ? NumberNode
    : [Kind] extends ['string']
      ? StringNode
      : [Kind] extends ['boolean']
        ? BooleanNode
        : [Kind] extends ['object']
          ? ObjectNode
          : [Kind] extends ['array']
            ? ArrayNode
            : never;
type StripNull<Type extends readonly SchemaTypeName[]> = Type extends readonly [
  infer Head extends SchemaTypeName,
  ...infer Tail extends SchemaTypeName[],
]
  ? Head extends 'null'
    ? StripNull<Tail>
    : readonly [Head, ...StripNull<Tail>]
  : readonly [];
type InferType<Type> = Type extends readonly [
  SchemaTypeName,
  ...SchemaTypeName[],
]
  ? [NonNullKinds<Type[number]>] extends [never]
    ? NullNode
    : [OneKind<NonNullKinds<Type[number]>>] extends [never]
      ? UnionNode<
          StripNull<Type> extends UnionSchemaType
            ? StripNull<Type>
            : UnionSchemaType,
          'null' extends Type[number] ? true : false
        >
      : OneKind<NonNullKinds<Type[number]>>
  : Type extends SchemaTypeName | 'virtual'
    ? KindNode<Type>
    : Type extends readonly string[]
      ? FieldNode
      : string extends Type
        ? FieldNode
        : never;
type InlineTypeKind<Type> = Type extends
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array'
  ? Type
  : Type extends readonly string[]
    ? [Exclude<Type[number], 'null'>] extends [never]
      ? 'null'
      : [Exclude<Type[number], 'null'>] extends ['object']
        ? 'object'
        : [Exclude<Type[number], 'null'>] extends ['array']
          ? 'array'
          : 'unsupported'
    : 'unsupported';
type InlineBranchKind<Branch> = Branch extends { $ref: unknown }
  ? 'unsupported'
  : Branch extends {
        controls: { active: unknown } | { discriminator: unknown };
      }
    ? 'unsupported'
    : Branch extends { type: infer Type }
      ? InlineTypeKind<Type>
      : 'unsupported';
type InlineHostNode<Kind> = 'unsupported' extends Kind
  ? FieldNode
  : 'object' extends Kind
    ? 'array' extends Kind
      ? never
      : [Exclude<Kind, 'object' | 'null'>] extends [never]
        ? ObjectNode
        : FieldNode
    : 'array' extends Kind
      ? [Exclude<Kind, 'array' | 'null'>] extends [never]
        ? ArrayNode
        : FieldNode
      : [Kind] extends ['null']
        ? NullNode
        : FieldNode;
type InferBranches<Branches> = Branches extends readonly [unknown, ...unknown[]]
  ? InlineHostNode<InlineBranchKind<Branches[number]>>
  : FieldNode;

/** Static node mapping; dynamic references and gates retain the full union. */
export type InferFieldNode<Schema> = Schema extends false
  ? never
  : Schema extends
        | { $ref: unknown }
        | { allOf: unknown }
        | { controls: { active: unknown } | { discriminator: unknown } }
    ? FieldNode
    : Schema extends { type: infer Type }
      ? InferType<Type>
      : Schema extends { oneOf: infer Branches }
        ? InferBranches<Branches>
        : Schema extends { anyOf: infer Branches }
          ? InferBranches<Branches>
          : Schema extends { const: infer Value }
            ? [LiteralKind<Value>] extends [never]
              ? never
              : OneKind<LiteralKind<Value>>
            : Schema extends { enum: infer Values }
              ? Values extends readonly []
                ? never
                : Values extends readonly [unknown, ...unknown[]]
                  ? OneKind<LiteralKind<Values[number]>>
                  : FieldNode
              : FieldNode;
