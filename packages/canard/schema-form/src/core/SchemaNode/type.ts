import { SetValueOption as InternalSetValueOption } from '../types/value';
import type { BlueprintSchema, SchemaTypeName } from '../blueprint';
import type { SchemaNodeRuntime } from '../record';

/** The four caller-facing flags understood by the first settlement engine. */
export const SetValueOption: Readonly<Pick<typeof InternalSetValueOption,
  'Overwrite' | 'Merge' | 'DisableAutomaticWrites' | 'EnableAutomaticWrites'>> =
  Object.freeze({
    Overwrite: InternalSetValueOption.Overwrite,
    Merge: InternalSetValueOption.Merge,
    DisableAutomaticWrites: InternalSetValueOption.DisableAutomaticWrites,
    EnableAutomaticWrites: InternalSetValueOption.EnableAutomaticWrites,
  });
export type SetValueOption = typeof SetValueOption[keyof typeof SetValueOption];

export type UnionMemberType = Exclude<SchemaTypeName, 'null'>;
export type UnionSchemaType = readonly [UnionMemberType, UnionMemberType,
  ...UnionMemberType[]];
export type NodeDiagnostics = SchemaNodeRuntime<unknown>['diagnostics'];
export type InactiveValue = Readonly<{ path: string; value: unknown }>;

/** Value admitted by one static JSON kind, before schema validation. */
export type ValueForKind<Kind extends UnionMemberType> =
  Kind extends 'string' ? string :
  Kind extends 'number' | 'integer' ? number :
  Kind extends 'boolean' ? boolean :
  Kind extends 'object' ? Record<string, unknown> :
  Kind extends 'array' ? readonly unknown[] : never;

/** Shared PR-2 surface; record storage remains behind the runtime class. */
export interface NodeSurface<
  Kind extends string,
  Strategy extends 'branch' | 'terminal',
  SchemaType,
  Value,
  Children,
  Nullable extends boolean = boolean,
> {
  readonly type: Kind;
  readonly strategy: Strategy;
  readonly schemaType: SchemaType;
  readonly jsonSchema: BlueprintSchema;
  readonly required: boolean;
  readonly nullable: Nullable;
  readonly depth: number;
  readonly isRoot: boolean;
  readonly rootNode: SchemaNode;
  readonly parentNode: SchemaNode | null;
  readonly name: string;
  readonly escapedName: string;
  readonly path: string;
  readonly children: Children;
  /** Interpreted terminal source or a branch's non-plain source. */
  readonly raw: unknown;
  /** Undeclared object keys retained in incoming own-key order. */
  readonly extras: unknown;
  readonly value: Value;
  readonly outputValue: unknown;
  readonly inactiveValues: readonly InactiveValue[];
  readonly active: boolean;
  /** Local visibility after all active declarations are combined. */
  readonly visible: boolean;
  /** A node is enabled when it remains active and visible. */
  readonly enabled: boolean;
  /** Local read-only state, including standard schema readOnly. */
  readonly readOnly: boolean;
  /** Local disabled state, independent of enabled. */
  readonly disabled: boolean;
  /** Effective watched values read from the emitted tree. */
  readonly watchValues: readonly unknown[];
  /** Shared context reference supplied by the current Form binding. */
  readonly context: Readonly<Record<string, unknown>>;
  readonly typeMismatch: boolean;
  readonly typeMismatches: readonly string[];
  readonly diagnostics: NodeDiagnostics;
  readonly defaultValue: unknown;
  find(pointer?: string | readonly string[] | null): SchemaNode | null;
  findNodes(pointer?: string | readonly string[] | null): readonly SchemaNode[];
  setValue(value: unknown, option?: SetValueOption): void;
  resetSubtree(option?: SetValueOption): void;
}

export type StringNode = NodeSurface<'string', 'terminal', 'string',
  string | null | undefined, null>;
export type NumberNode = NodeSurface<'number', 'terminal', 'number' | 'integer',
  number | null | undefined, null>;
export type BooleanNode = NodeSurface<'boolean', 'terminal', 'boolean',
  boolean | null | undefined, null>;
export type NullNode = NodeSurface<'null', 'terminal', 'null', null | undefined, null>;
export type ObjectNode =
  | NodeSurface<'object', 'branch', 'object', Record<string, unknown> | null | undefined,
    readonly SchemaNode[]>
  | NodeSurface<'object', 'terminal', 'object', Record<string, unknown> | null | undefined,
    null>;
/** Structural edits shared by branch and terminal array nodes. */
interface ArrayNodeMethods<Item> {
  /** Append one caller value and return the new length synchronously. */
  push(value?: Item): number;
  /** Remove the final position and return its last committed value. */
  pop(): Item | undefined;
  /** Replace one position without changing its snapshot or identity. */
  update(index: number, value: Item): Item | undefined;
  /** Remove one position and return its last committed value. */
  remove(index: number): Item | undefined;
  /** Remove every position without returning an item. */
  clear(): void;
}

export type ArrayNode<Item = unknown> =
  | (NodeSurface<'array', 'branch', 'array', readonly Item[] | null | undefined,
    readonly SchemaNode[]> & ArrayNodeMethods<Item>)
  | (NodeSurface<'array', 'terminal', 'array', readonly Item[] | null | undefined,
    null> & ArrayNodeMethods<Item>);
export type VirtualNode = NodeSurface<'virtual', 'branch', 'virtual',
  readonly unknown[] | undefined, readonly SchemaNode[]>;

export type UnionNode<
  Types extends UnionSchemaType = UnionSchemaType,
  Nullable extends boolean = boolean,
> =
  | (NodeSurface<'union', 'terminal', Types,
      ValueForKind<Types[number]> | undefined |
        (Nullable extends true ? null : never), null, Nullable> &
      { readonly typeMismatch: false })
  | (NodeSurface<'union', 'terminal', Types, unknown, null, Nullable> &
      { readonly typeMismatch: true });

/** Union input sees the mismatch lamp without accepting a mismatched write. */
export type FormTypeInputProps<
  Types extends UnionSchemaType = UnionSchemaType,
  Nullable extends boolean = boolean,
> =
  | {
      readonly typeMismatch: false;
      readonly value: ValueForKind<Types[number]> | undefined |
        (Nullable extends true ? null : never);
      readonly onChange: (value: ValueForKind<Types[number]> | undefined |
        (Nullable extends true ? null : never)) => void;
    }
  | {
      readonly typeMismatch: true;
      readonly value: unknown;
      readonly onChange: (value: ValueForKind<Types[number]> | undefined |
        (Nullable extends true ? null : never)) => void;
    };

/** Public type discrimination is independent of the single runtime class. */
export type SchemaNode = StringNode | NumberNode | BooleanNode | NullNode |
  ObjectNode | ArrayNode | VirtualNode | UnionNode;
export type BranchNode = Extract<SchemaNode, { strategy: 'branch' }>;
export type TerminalNode = Exclude<SchemaNode, BranchNode>;

type LiteralKind<Value> = Value extends string ? 'string' :
  Value extends number ? 'number' : Value extends boolean ? 'boolean' :
  Value extends null ? 'null' : Value extends readonly unknown[] ? 'array' :
  Value extends Record<string, unknown> ? 'object' : never;
type KindNode<Kind> = Kind extends 'string' ? StringNode :
  Kind extends 'number' | 'integer' ? NumberNode :
  Kind extends 'boolean' ? BooleanNode : Kind extends 'null' ? NullNode :
  Kind extends 'object' ? ObjectNode : Kind extends 'array' ? ArrayNode :
  Kind extends 'virtual' ? VirtualNode : never;
type NonNullKinds<Type> = Exclude<Type, 'null'>;
type OneKind<Kind> = [Kind] extends [never] ? never :
  [Kind] extends ['number' | 'integer'] ? NumberNode :
  [Kind] extends ['string'] ? StringNode :
  [Kind] extends ['boolean'] ? BooleanNode :
  [Kind] extends ['object'] ? ObjectNode :
  [Kind] extends ['array'] ? ArrayNode : never;
type StripNull<Type extends readonly SchemaTypeName[]> =
  Type extends readonly [infer Head extends SchemaTypeName,
    ...infer Tail extends SchemaTypeName[]]
    ? Head extends 'null' ? StripNull<Tail> : readonly [Head, ...StripNull<Tail>]
    : readonly [];
type InferType<Type> = Type extends readonly [SchemaTypeName, ...SchemaTypeName[]]
  ? [NonNullKinds<Type[number]>] extends [never] ? NullNode :
    [OneKind<NonNullKinds<Type[number]>>] extends [never]
      ? UnionNode<StripNull<Type> extends UnionSchemaType ? StripNull<Type> :
        UnionSchemaType, 'null' extends Type[number] ? true : false>
      : OneKind<NonNullKinds<Type[number]>>
  : Type extends SchemaTypeName | 'virtual' ? KindNode<Type> :
    Type extends readonly string[] ? SchemaNode :
      string extends Type ? SchemaNode : never;
type InlineTypeKind<Type> = Type extends
  | 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'object' | 'array'
  ? Type
  : Type extends readonly string[]
    ? [Exclude<Type[number], 'null'>] extends [never] ? 'null' :
      [Exclude<Type[number], 'null'>] extends ['object'] ? 'object' :
      [Exclude<Type[number], 'null'>] extends ['array'] ? 'array' :
      'unsupported'
    : 'unsupported';
type InlineBranchKind<Branch> = Branch extends { $ref: unknown } ? 'unsupported' :
  Branch extends { controls: { active: unknown } | { discriminator: unknown } }
    ? 'unsupported' : Branch extends { type: infer Type }
      ? InlineTypeKind<Type> : 'unsupported';
type InlineHostNode<Kind> = 'unsupported' extends Kind ? SchemaNode :
  'object' extends Kind ? 'array' extends Kind ? never :
    [Exclude<Kind, 'object' | 'null'>] extends [never] ? ObjectNode : SchemaNode :
  'array' extends Kind ?
    [Exclude<Kind, 'array' | 'null'>] extends [never] ? ArrayNode : SchemaNode :
  [Kind] extends ['null'] ? NullNode : SchemaNode;
type InferBranches<Branches> = Branches extends readonly [unknown, ...unknown[]]
  ? InlineHostNode<InlineBranchKind<Branches[number]>>
  : SchemaNode;

/** Static node mapping; dynamic references and gates retain the full union. */
export type InferSchemaNode<Schema> = Schema extends false ? never : Schema extends
  { $ref: unknown } | { allOf: unknown } |
  { controls: { active: unknown } | { discriminator: unknown } }
  ? SchemaNode
  : Schema extends { type: infer Type }
    ? InferType<Type>
    : Schema extends { oneOf: infer Branches }
      ? InferBranches<Branches>
      : Schema extends { anyOf: infer Branches }
        ? InferBranches<Branches>
        : Schema extends { const: infer Value }
          ? [LiteralKind<Value>] extends [never] ? never :
            OneKind<LiteralKind<Value>>
          : Schema extends { enum: infer Values }
            ? Values extends readonly [] ? never :
              Values extends readonly [unknown, ...unknown[]]
                ? OneKind<LiteralKind<Values[number]>> : SchemaNode
            : SchemaNode;
