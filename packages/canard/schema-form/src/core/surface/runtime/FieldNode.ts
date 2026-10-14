import type {
  BlueprintNode,
  BlueprintSchemaType,
  EffectiveSchema,
} from '../../engine';
import {
  dispatchBatch,
  dispatchClear,
  dispatchClearExternalErrors,
  dispatchClearSubtreeState,
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  dispatchRequest,
  dispatchResetSubtree,
  dispatchSetExternalErrors,
  dispatchSetState,
  dispatchSetSubtreeState,
  dispatchSetValue,
  dispatchUpdate,
  dispatchValidate,
  readFieldNodeRevision,
  subscribeFieldNode,
} from '../../engine';
import type { FieldNodeListener } from '../../engine';
import { find, findNodes } from '../../engine';
import { EMPTY_REVISION_LEDGER } from '../../engine';
import type {
  Behavior,
  FieldNodeEventType,
  FieldNodeRecord,
  FieldNodeRequestType,
  FieldNodeRuntime,
} from '../../engine';
import {
  readFieldNodeDefaultValue,
  readFieldNodeInactiveValues,
  readFieldNodeMisfit,
  readFieldNodeMisfits,
  readFieldNodeWatchValues,
} from '../../engine';
import type { NodeStateFlags } from '../../engine';
import { EMPTY_GLOBAL_ERRORS, readFieldNodeErrors } from '../../engine';
import type { ValidationIssue } from '../../engine';
import { SetValueOption } from '../type';

/** Runtime record implementation; the public FieldNode name denotes a union type. */
export class FieldNode implements FieldNodeRecord<FieldNode> {
  readonly behavior: Behavior<FieldNode>;
  readonly runtime: FieldNodeRuntime<FieldNode>;
  readonly blueprintNode: BlueprintNode;
  parent: FieldNode | null;
  private readonly root: FieldNode;
  private storedName: string;
  private storedEscapedName: string;
  private storedPath: string;
  private storedDepth: number;
  private storedRequired: boolean;
  private readonly storedNullable: boolean;
  private readonly storedSchemaType: BlueprintSchemaType | undefined;
  structure: Record<string, FieldNode> | null;
  private storedChildren: readonly FieldNode[] | null;
  itemKey: number | null;
  itemCount: number;
  nextItemKey: number;
  private storedRaw: unknown;
  private storedUndeclaredValues: unknown;
  private storedActive: boolean;
  private storedVisible: boolean;
  private storedReadOnly: boolean;
  private storedDisabled: boolean;
  local: unknown;
  emit: unknown;
  schema: EffectiveSchema;
  interactionState: FieldNodeRecord<FieldNode>['interactionState'];
  /** Per-bit counts copied only after this occurrence first receives delivery. */
  revisionLedger: Readonly<Record<number, number>>;
  deliveryInitialized: boolean;
  deliveryChanges: number;
  deliveryPreviousLocal: unknown;
  deliveryPreviousEmit: unknown;
  deliveryPreviousPath: string | undefined;
  deliveryPreviousChildren: readonly FieldNode[] | null | undefined;
  deliveryPreviousComputed: number | undefined;
  deliveryPreviousSchema: EffectiveSchema | undefined;
  deliveryPreviousState: NodeStateFlags | undefined;
  deliveryWatchValues: readonly unknown[] | undefined;
  pendingDelivery: FieldNodeRecord<FieldNode>['pendingDelivery'];
  pendingRevision: number;
  pendingNonSettleDelivery: FieldNodeRecord<FieldNode>['pendingNonSettleDelivery'];
  detached: boolean;
  disposed: boolean;
  interactionReset: number;

  constructor(
    behavior: Behavior<FieldNode>,
    runtime: FieldNodeRuntime<FieldNode>,
    blueprintNode: BlueprintNode,
    parent: FieldNode | null,
    name: string,
    escapedName: string,
    path: string,
    depth: number,
    structure: Record<string, FieldNode> | null,
    children: readonly FieldNode[] | null,
    schema: EffectiveSchema,
    state: FieldNodeRecord<FieldNode>['interactionState'],
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
    this.itemKey = null;
    this.itemCount = 0;
    this.nextItemKey = 0;
    this.storedRaw = undefined;
    this.storedUndeclaredValues = undefined;
    this.storedActive = true;
    this.storedVisible = true;
    this.storedReadOnly = false;
    this.storedDisabled = false;
    this.local = undefined;
    this.emit = undefined;
    this.schema = schema;
    this.interactionState = state;
    this.revisionLedger = EMPTY_REVISION_LEDGER;
    this.deliveryInitialized = false;
    this.deliveryChanges = 0;
    this.deliveryPreviousLocal = undefined;
    this.deliveryPreviousEmit = undefined;
    this.deliveryPreviousPath = undefined;
    this.deliveryPreviousChildren = undefined;
    this.deliveryPreviousComputed = undefined;
    this.deliveryPreviousSchema = undefined;
    this.deliveryPreviousState = undefined;
    this.deliveryWatchValues = undefined;
    this.pendingDelivery = undefined;
    this.pendingRevision = 0;
    this.pendingNonSettleDelivery = undefined;
    this.detached = false;
    this.disposed = false;
    this.interactionReset = 0;
  }

  /** {@inheritDoc NodeSurface.type} */
  get type() {
    return this.behavior.type;
  }
  /** {@inheritDoc NodeSurface.strategy} */
  get strategy() {
    return this.behavior.strategy;
  }
  /** {@inheritDoc NodeSurface.schemaType} */
  get schemaType() {
    return this.storedSchemaType;
  }
  /** {@inheritDoc NodeSurface.jsonSchema} */
  get jsonSchema() {
    return this.schema.schema;
  }
  /** {@inheritDoc NodeSurface.required} */
  get required() {
    return this.storedRequired;
  }
  set required(value: boolean) {
    this.storedRequired = value;
  }
  /** {@inheritDoc NodeSurface.nullable} */
  get nullable() {
    return this.storedNullable;
  }
  /** {@inheritDoc NodeSurface.depth} */
  get depth() {
    return this.storedDepth;
  }
  set depth(value: number) {
    this.storedDepth = value;
  }
  /** {@inheritDoc NodeSurface.isRoot} */
  get isRoot() {
    return this.parent === null;
  }
  /** {@inheritDoc NodeSurface.rootNode} */
  get rootNode() {
    return this.root;
  }
  /** {@inheritDoc NodeSurface.parentNode} */
  get parentNode() {
    return this.parent;
  }
  /** {@inheritDoc NodeSurface.name} */
  get name() {
    return this.storedName;
  }
  set name(value: string) {
    this.storedName = value;
  }
  /** {@inheritDoc NodeSurface.escapedName} */
  get escapedName() {
    return this.storedEscapedName;
  }
  set escapedName(value: string) {
    this.storedEscapedName = value;
  }
  /** {@inheritDoc NodeSurface.path} */
  get path() {
    return this.storedPath;
  }
  set path(value: string) {
    this.storedPath = value;
  }
  /** {@inheritDoc NodeSurface.children} */
  get children() {
    return this.storedChildren;
  }
  set children(value: readonly FieldNode[] | null) {
    this.storedChildren = value;
  }
  /** {@inheritDoc NodeSurface.raw} */
  get raw() {
    return this.storedRaw;
  }
  set raw(value: unknown) {
    this.storedRaw = value;
  }
  /** {@inheritDoc NodeSurface.undeclaredValues} */
  get undeclaredValues() {
    return this.storedUndeclaredValues;
  }
  set undeclaredValues(value: unknown) {
    this.storedUndeclaredValues = value;
  }
  /** {@inheritDoc NodeSurface.value} */
  get value() {
    return this.local;
  }
  /** {@inheritDoc NodeSurface.outputValue} */
  get outputValue() {
    return this.emit;
  }
  /** {@inheritDoc NodeSurface.inactiveValues} */
  get inactiveValues() {
    return readFieldNodeInactiveValues<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.active} */
  get active() {
    return this.storedActive;
  }
  set active(value: boolean) {
    this.storedActive = value;
  }
  /** {@inheritDoc NodeSurface.visible} */
  get visible() {
    return this.storedVisible;
  }
  set visible(value: boolean) {
    this.storedVisible = value;
  }
  /** {@inheritDoc NodeSurface.enabled} */
  get enabled() {
    return this.active && this.visible;
  }
  /** {@inheritDoc NodeSurface.readOnly} */
  get readOnly() {
    return this.storedReadOnly;
  }
  set readOnly(value: boolean) {
    this.storedReadOnly = value;
  }
  /** {@inheritDoc NodeSurface.disabled} */
  get disabled() {
    return this.storedDisabled;
  }
  set disabled(value: boolean) {
    this.storedDisabled = value;
  }
  /** {@inheritDoc NodeSurface.watchValues} */
  get watchValues() {
    return readFieldNodeWatchValues<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.context} */
  get context() {
    return this.runtime.context;
  }
  /** {@inheritDoc NodeSurface.misfit} */
  get misfit() {
    return readFieldNodeMisfit<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.misfits} */
  get misfits() {
    return readFieldNodeMisfits<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.diagnostics} */
  get diagnostics(): FieldNodeRuntime<FieldNode>['diagnostics'] {
    return this.runtime.diagnostics;
  }
  /** {@inheritDoc NodeSurface.defaultValue} */
  get defaultValue() {
    return readFieldNodeDefaultValue<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.find} */
  find(pointer?: string | readonly string[] | null) {
    return find<FieldNode>(this, pointer);
  }
  /** {@inheritDoc NodeSurface.findNodes} */
  findNodes(pointer?: string | readonly string[] | null) {
    return findNodes<FieldNode>(this, pointer);
  }
  /** {@inheritDoc NodeSurface.setValue} */
  setValue(value: unknown, option: SetValueOption = SetValueOption.Overwrite) {
    return dispatchSetValue<FieldNode>(this, value, option);
  }
  /** {@inheritDoc ArrayNode.push} */
  push(value?: unknown) {
    return dispatchPush<FieldNode>(this, value);
  }
  /** {@inheritDoc ArrayNode.pop} */
  pop() {
    return dispatchPop<FieldNode>(this);
  }
  /** {@inheritDoc ArrayNode.update} */
  update(index: number, value: unknown) {
    return dispatchUpdate<FieldNode>(this, index, value);
  }
  /** {@inheritDoc ArrayNode.remove} */
  remove(index: number) {
    return dispatchRemove<FieldNode>(this, index);
  }
  /** {@inheritDoc ArrayNode.clear} */
  clear() {
    return dispatchClear<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.resetSubtree} */
  resetSubtree(option: SetValueOption = SetValueOption.Overwrite) {
    return dispatchResetSubtree<FieldNode>(this, option);
  }
  /** {@inheritDoc NodeSurface.state} */
  get state() {
    return this.interactionState;
  }
  /** {@inheritDoc NodeSurface.state} */
  set state(value: NodeStateFlags) {
    dispatchSetState<FieldNode>(this, value);
  }
  /** {@inheritDoc NodeSurface.setState} */
  setState(state: NodeStateFlags) {
    return dispatchSetState<FieldNode>(this, state);
  }
  /** {@inheritDoc NodeSurface.globalState} */
  get globalState() {
    return this.runtime.globalState;
  }
  /** {@inheritDoc NodeSurface.setSubtreeState} */
  setSubtreeState(state: NodeStateFlags) {
    return dispatchSetSubtreeState<FieldNode>(this, state);
  }
  /** {@inheritDoc NodeSurface.clearSubtreeState} */
  clearSubtreeState() {
    return dispatchClearSubtreeState<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.errors} */
  get errors() {
    return readFieldNodeErrors<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.globalErrors} */
  get globalErrors() {
    return this.runtime.globalErrors ?? EMPTY_GLOBAL_ERRORS;
  }
  /** {@inheritDoc NodeSurface.setExternalErrors} */
  setExternalErrors(errors: readonly ValidationIssue[]) {
    return dispatchSetExternalErrors<FieldNode>(this, errors);
  }
  /** {@inheritDoc NodeSurface.clearExternalErrors} */
  clearExternalErrors() {
    return dispatchClearExternalErrors<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.validate} */
  validate() {
    return dispatchValidate<FieldNode>(this);
  }
  /** {@inheritDoc NodeSurface.subscribe} */
  subscribe(listener: FieldNodeListener) {
    return subscribeFieldNode<FieldNode>(this, listener);
  }
  /** {@inheritDoc NodeSurface.revision} */
  revision(mask?: FieldNodeEventType) {
    return readFieldNodeRevision<FieldNode>(this, mask);
  }
  /** {@inheritDoc NodeSurface.request} */
  request(kind: FieldNodeRequestType) {
    return dispatchRequest<FieldNode>(this, kind);
  }
  /** {@inheritDoc NodeSurface.batch} */
  batch(fn: () => void) {
    return dispatchBatch<FieldNode>(this, fn);
  }
}
