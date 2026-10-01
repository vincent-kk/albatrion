import type { BlueprintNode, BlueprintSchemaType, EffectiveSchema } from '../blueprint';
import { find, findNodes } from '../navigation';
import { dispatchBatch, dispatchClearExternalErrors, dispatchClearSubtreeState,
  dispatchRequest, dispatchResetSubtree, dispatchSetExternalErrors,
  dispatchSetState, dispatchSetSubtreeState, dispatchSetValue, dispatchValidate,
  readSchemaNodeRevision, subscribeSchemaNode } from '../dispatch';
import type { SchemaNodeListener } from '../dispatch';
import { EMPTY_REVISION_LEDGER } from '../record';
import type { Behavior, SchemaNodeEventType, SchemaNodeRecord,
  SchemaNodeRequestType, SchemaNodeRuntime } from '../record';
import { readSchemaNodeDefaultValue,
  readSchemaNodeInactiveValues, readSchemaNodeTypeMismatch,
  readSchemaNodeTypeMismatches, readSchemaNodeWatchValues } from '../settle';
import { readSchemaNodeErrors } from '../validation';
import type { ValidationIssue } from '../validation';
import type { NodeStateFlags } from '../types/state';
import { SetValueOption } from './type';

/** Shared empty whole-form issue list before a validation result exists. */
const EMPTY_GLOBAL_ERRORS: readonly ValidationIssue[] = Object.freeze([]);

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
  private storedVisible: boolean;
  private storedReadOnly: boolean;
  private storedDisabled: boolean;
  local: unknown;
  emit: unknown;
  schema: EffectiveSchema;
  interactionState: SchemaNodeRecord<SchemaNode>['interactionState'];
  /** Per-bit counts copied only after this occurrence first receives delivery. */
  revisionLedger: Readonly<Record<number, number>>;
  detached: boolean;

  constructor(
    behavior: Behavior<SchemaNode>, runtime: SchemaNodeRuntime<SchemaNode>,
    blueprintNode: BlueprintNode, parent: SchemaNode | null,
    name: string, escapedName: string, path: string, depth: number,
    structure: Record<string, SchemaNode> | null,
    children: readonly SchemaNode[] | null, schema: EffectiveSchema,
    state: SchemaNodeRecord<SchemaNode>['interactionState'],
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
    this.storedVisible = true;
    this.storedReadOnly = false;
    this.storedDisabled = false;
    this.local = undefined;
    this.emit = undefined;
    this.schema = schema;
    this.interactionState = state;
    this.revisionLedger = EMPTY_REVISION_LEDGER;
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
  get inactiveValues() { return readSchemaNodeInactiveValues<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.active} */
  get active() { return this.storedActive; }
  set active(value: boolean) { this.storedActive = value; }
  /** {@inheritDoc NodeSurface.visible} */
  get visible() { return this.storedVisible; }
  set visible(value: boolean) { this.storedVisible = value; }
  /** {@inheritDoc NodeSurface.enabled} */
  get enabled() { return this.active && this.visible; }
  /** {@inheritDoc NodeSurface.readOnly} */
  get readOnly() { return this.storedReadOnly; }
  set readOnly(value: boolean) { this.storedReadOnly = value; }
  /** {@inheritDoc NodeSurface.disabled} */
  get disabled() { return this.storedDisabled; }
  set disabled(value: boolean) { this.storedDisabled = value; }
  /** {@inheritDoc NodeSurface.watchValues} */
  get watchValues() { return readSchemaNodeWatchValues<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.context} */
  get context() { return this.runtime.context; }
  /** {@inheritDoc NodeSurface.typeMismatch} */
  get typeMismatch() { return readSchemaNodeTypeMismatch<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.typeMismatches} */
  get typeMismatches() { return readSchemaNodeTypeMismatches<SchemaNode>(this); }
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
  setValue(value: unknown, option: SetValueOption = SetValueOption.Overwrite) {
    return dispatchSetValue<SchemaNode>(this, value, option);
  }
  /** {@inheritDoc NodeSurface.resetSubtree} */
  resetSubtree(option: SetValueOption = SetValueOption.Overwrite) {
    return dispatchResetSubtree<SchemaNode>(this, option);
  }
  /** {@inheritDoc NodeSurface.state} */
  get state() { return this.interactionState; }
  /** {@inheritDoc NodeSurface.state} */
  set state(value: NodeStateFlags) { dispatchSetState<SchemaNode>(this, value); }
  /** {@inheritDoc NodeSurface.setState} */
  setState(state: NodeStateFlags) { return dispatchSetState<SchemaNode>(this, state); }
  /** {@inheritDoc NodeSurface.globalState} */
  get globalState() { return this.runtime.globalState; }
  /** {@inheritDoc NodeSurface.setSubtreeState} */
  setSubtreeState(state: NodeStateFlags) {
    return dispatchSetSubtreeState<SchemaNode>(this, state);
  }
  /** {@inheritDoc NodeSurface.clearSubtreeState} */
  clearSubtreeState() { return dispatchClearSubtreeState<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.errors} */
  get errors() { return readSchemaNodeErrors<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.globalErrors} */
  get globalErrors() { return this.runtime.globalErrors ?? EMPTY_GLOBAL_ERRORS; }
  /** {@inheritDoc NodeSurface.setExternalErrors} */
  setExternalErrors(errors: readonly ValidationIssue[]) {
    return dispatchSetExternalErrors<SchemaNode>(this, errors);
  }
  /** {@inheritDoc NodeSurface.clearExternalErrors} */
  clearExternalErrors() { return dispatchClearExternalErrors<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.validate} */
  validate() { return dispatchValidate<SchemaNode>(this); }
  /** {@inheritDoc NodeSurface.subscribe} */
  subscribe(listener: SchemaNodeListener) {
    return subscribeSchemaNode<SchemaNode>(this, listener);
  }
  /** {@inheritDoc NodeSurface.revision} */
  revision(mask?: SchemaNodeEventType) {
    return readSchemaNodeRevision<SchemaNode>(this, mask);
  }
  /** {@inheritDoc NodeSurface.request} */
  request(kind: SchemaNodeRequestType) { return dispatchRequest<SchemaNode>(this, kind); }
  /** {@inheritDoc NodeSurface.batch} */
  batch(fn: () => void) { return dispatchBatch<SchemaNode>(this, fn); }
}
