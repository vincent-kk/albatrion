import type { BlueprintNode, BlueprintSchemaType, EffectiveSchema } from '../blueprint';
import { find, findNodes } from '../navigation';
import type { Behavior, SchemaNodeRecord, SchemaNodeRuntime } from '../record';
import { readSchemaNodeDefaultValue, resetSchemaNodeSubtree,
  writeSchemaNode } from '../settle';
import { SetValueOption } from './type';
import type { InactiveValue, SetValueOption as PublicSetValueOption } from './type';

const EMPTY_PATHS: readonly string[] = Object.freeze([]);
const EMPTY_VALUES: readonly InactiveValue[] = Object.freeze([]);

/** Runtime record implementation; the public SchemaNode name denotes a union type. */
export class SchemaNode implements SchemaNodeRecord<SchemaNode> {
  readonly behavior: Behavior<SchemaNode>;
  readonly runtime: SchemaNodeRuntime<SchemaNode>;
  readonly blueprintNode: BlueprintNode;
  parent: SchemaNode | null;
  private readonly root: SchemaNode;
  private storedName: string;
  private storedEscapedName: string;
  private storedPath: string;
  private storedDepth: number;
  private storedRequired: boolean;
  private readonly storedNullable: boolean;
  private readonly storedSchemaType: BlueprintSchemaType;
  structure: Record<string, SchemaNode> | null;
  private storedChildren: readonly SchemaNode[] | null;
  private storedRaw: unknown;
  private storedExtras: unknown;
  private storedActive: boolean;
  local: unknown;
  emit: unknown;
  schema: EffectiveSchema;
  state: SchemaNodeRecord<SchemaNode>['state'];
  revision: number;
  detached: boolean;

  constructor(
    behavior: Behavior<SchemaNode>, runtime: SchemaNodeRuntime<SchemaNode>,
    blueprintNode: BlueprintNode, parent: SchemaNode | null,
    name: string, escapedName: string, path: string, depth: number,
    structure: Record<string, SchemaNode> | null,
    children: readonly SchemaNode[] | null, schema: EffectiveSchema,
    state: SchemaNodeRecord<SchemaNode>['state'],
  ) {
    this.behavior = behavior;
    this.runtime = runtime;
    this.blueprintNode = blueprintNode;
    this.parent = parent;
    this.root = parent?.rootNode ?? this;
    this.storedName = name;
    this.storedEscapedName = escapedName;
    this.storedPath = path;
    this.storedDepth = depth;
    this.storedRequired = false;
    this.storedNullable = blueprintNode.nullable;
    this.storedSchemaType = blueprintNode.schemaType;
    this.structure = structure;
    this.storedChildren = children;
    this.storedRaw = undefined;
    this.storedExtras = undefined;
    this.storedActive = true;
    this.local = undefined;
    this.emit = undefined;
    this.schema = schema;
    this.state = state;
    this.revision = 0;
    this.detached = false;
  }

  /** {@inheritDoc NodeSurface.type} */
  get type() { return this.behavior.type; }
  /** {@inheritDoc NodeSurface.strategy} */
  get strategy() { return this.behavior.strategy; }
  /** {@inheritDoc NodeSurface.schemaType} */
  get schemaType() { return this.storedSchemaType; }
  /** {@inheritDoc NodeSurface.jsonSchema} */
  get jsonSchema() { return this.schema.schema; }
  /** {@inheritDoc NodeSurface.required} */
  get required() { return this.storedRequired; }
  set required(value: boolean) { this.storedRequired = value; }
  /** {@inheritDoc NodeSurface.nullable} */
  get nullable() { return this.storedNullable; }
  /** {@inheritDoc NodeSurface.depth} */
  get depth() { return this.storedDepth; }
  set depth(value: number) { this.storedDepth = value; }
  /** {@inheritDoc NodeSurface.isRoot} */
  get isRoot() { return this.parent === null; }
  /** {@inheritDoc NodeSurface.rootNode} */
  get rootNode() { return this.root; }
  /** {@inheritDoc NodeSurface.parentNode} */
  get parentNode() { return this.parent; }
  /** {@inheritDoc NodeSurface.name} */
  get name() { return this.storedName; }
  set name(value: string) { this.storedName = value; }
  /** {@inheritDoc NodeSurface.escapedName} */
  get escapedName() { return this.storedEscapedName; }
  set escapedName(value: string) { this.storedEscapedName = value; }
  /** {@inheritDoc NodeSurface.path} */
  get path() { return this.storedPath; }
  set path(value: string) { this.storedPath = value; }
  /** {@inheritDoc NodeSurface.children} */
  get children() { return this.storedChildren; }
  set children(value: readonly SchemaNode[] | null) { this.storedChildren = value; }
  /** {@inheritDoc NodeSurface.raw} */
  get raw() { return this.storedRaw; }
  set raw(value: unknown) { this.storedRaw = value; }
  /** {@inheritDoc NodeSurface.extras} */
  get extras() { return this.storedExtras; }
  set extras(value: unknown) { this.storedExtras = value; }
  /** {@inheritDoc NodeSurface.value} */
  get value() { return this.local; }
  /** {@inheritDoc NodeSurface.outputValue} */
  get outputValue() { return this.emit; }
  /** {@inheritDoc NodeSurface.inactiveValues} */
  get inactiveValues() {
    return this.runtime.inactiveValuesMemo.get(this.path) ?? EMPTY_VALUES;
  }
  /** {@inheritDoc NodeSurface.active} */
  get active() { return this.storedActive; }
  set active(value: boolean) { this.storedActive = value; }
  /** {@inheritDoc NodeSurface.typeMismatch} */
  get typeMismatch() { return this.runtime.typeMismatchPaths.has(this.path); }
  /** {@inheritDoc NodeSurface.typeMismatches} */
  get typeMismatches() {
    return this.runtime.typeMismatchesMemo?.get(this.path)?.paths ?? EMPTY_PATHS;
  }
  /** {@inheritDoc NodeSurface.diagnostics} */
  get diagnostics(): SchemaNodeRuntime<SchemaNode>['diagnostics'] {
    return this.runtime.diagnostics;
  }
  /** {@inheritDoc NodeSurface.defaultValue} */
  get defaultValue() { return readSchemaNodeDefaultValue<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.find} */
  find(pointer?: string | readonly string[] | null) {
    return find<SchemaNode>(this, pointer);
  }
  /** {@inheritDoc NodeSurface.findNodes} */
  findNodes(pointer?: string | readonly string[] | null) {
    return findNodes<SchemaNode>(this, pointer);
  }
  /** {@inheritDoc NodeSurface.setValue} */
  setValue(value: unknown, option: PublicSetValueOption = SetValueOption.Overwrite) {
    return writeSchemaNode<SchemaNode>(this, value, 'callerReplace', option);
  }
  /** {@inheritDoc NodeSurface.resetSubtree} */
  resetSubtree(option: PublicSetValueOption = SetValueOption.Overwrite) {
    return resetSchemaNodeSubtree<SchemaNode>(this, option);
  }
}
