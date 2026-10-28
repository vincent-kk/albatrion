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
  dispatchInsert,
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
  dispatchVisitSubtree,
  onInactiveFieldNode,
  readFieldNodeRevision,
  subscribeFieldNode,
} from '../../engine';
import type { InactiveValueResolver } from '../../engine';
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

  get type() {
    return this.behavior.type;
  }
  get strategy() {
    return this.behavior.strategy;
  }
  get schemaType() {
    return this.storedSchemaType;
  }
  get jsonSchema() {
    return this.schema.schema;
  }
  get required() {
    return this.storedRequired;
  }
  set required(value: boolean) {
    this.storedRequired = value;
  }
  get nullable() {
    return this.storedNullable;
  }
  get depth() {
    return this.storedDepth;
  }
  set depth(value: number) {
    this.storedDepth = value;
  }
  get isRoot() {
    return this.parent === null;
  }
  get rootNode() {
    return this.root;
  }
  get parentNode() {
    return this.parent;
  }
  get name() {
    return this.storedName;
  }
  set name(value: string) {
    this.storedName = value;
  }
  get escapedName() {
    return this.storedEscapedName;
  }
  set escapedName(value: string) {
    this.storedEscapedName = value;
  }
  get path() {
    return this.storedPath;
  }
  set path(value: string) {
    this.storedPath = value;
  }
  get children() {
    return this.storedChildren;
  }
  set children(value: readonly FieldNode[] | null) {
    this.storedChildren = value;
  }
  get raw() {
    return this.storedRaw;
  }
  set raw(value: unknown) {
    this.storedRaw = value;
  }
  get undeclaredValues() {
    return this.storedUndeclaredValues;
  }
  set undeclaredValues(value: unknown) {
    this.storedUndeclaredValues = value;
  }
  get value() {
    return this.local;
  }
  get outputValue() {
    return this.emit;
  }
  get inactiveValues() {
    return readFieldNodeInactiveValues<FieldNode>(this);
  }
  get active() {
    return this.storedActive;
  }
  set active(value: boolean) {
    this.storedActive = value;
  }
  get visible() {
    return this.storedVisible;
  }
  set visible(value: boolean) {
    this.storedVisible = value;
  }
  /** A node is enabled when it remains active and visible. */
  get enabled() {
    return this.active && this.visible;
  }
  get readOnly() {
    return this.storedReadOnly;
  }
  set readOnly(value: boolean) {
    this.storedReadOnly = value;
  }
  get disabled() {
    return this.storedDisabled;
  }
  set disabled(value: boolean) {
    this.storedDisabled = value;
  }
  /** Effective watched values read from the emitted tree. */
  get watchValues() {
    return readFieldNodeWatchValues<FieldNode>(this);
  }
  /** Shared context reference supplied by the current Form binding. */
  get context() {
    return this.runtime.context;
  }
  get misfit() {
    return readFieldNodeMisfit<FieldNode>(this);
  }
  get misfits() {
    return readFieldNodeMisfits<FieldNode>(this);
  }
  get diagnostics(): FieldNodeRuntime<FieldNode>['diagnostics'] {
    return this.runtime.diagnostics;
  }
  get defaultValue() {
    return readFieldNodeDefaultValue<FieldNode>(this);
  }
  find(pointer?: string | readonly string[] | null) {
    return find<FieldNode>(this, pointer);
  }
  findNodes(pointer?: string | readonly string[] | null) {
    return findNodes<FieldNode>(this, pointer);
  }
  /** Visit this occurrence and its current-shape subtree in preorder; writes settle once at the end. */
  visitSubtree(visitor: (node: FieldNode) => void | boolean) {
    return dispatchVisitSubtree<FieldNode>(this, visitor);
  }
  setValue(value: unknown, option: SetValueOption = SetValueOption.Overwrite) {
    return dispatchSetValue<FieldNode>(this, value, option);
  }
  /** Append one caller value and return the new length synchronously. */
  push(value?: unknown) {
    return dispatchPush<FieldNode>(this, value);
  }
  /** Remove the final position and return its last committed value. */
  pop() {
    return dispatchPop<FieldNode>(this);
  }
  /** Replace one position without changing its snapshot or identity. */
  update(index: number, value: unknown) {
    return dispatchUpdate<FieldNode>(this, index, value);
  }
  /** Remove one position and return its last committed value. */
  remove(index: number) {
    return dispatchRemove<FieldNode>(this, index);
  }
  /** Insert one caller value at a position in [0, length] and return the new length synchronously. */
  insert(index: number, value?: unknown) {
    return dispatchInsert<FieldNode>(this, index, value);
  }
  /** Remove every position without returning an item. */
  clear() {
    return dispatchClear<FieldNode>(this);
  }
  resetSubtree(option: SetValueOption = SetValueOption.Overwrite) {
    return dispatchResetSubtree<FieldNode>(this, option);
  }
  /** Local interaction flags, patched through the dispatcher on assignment. */
  get state() {
    return this.interactionState;
  }
  set state(value: NodeStateFlags) {
    dispatchSetState<FieldNode>(this, value);
  }
  /** Patch this occurrence's interaction flags. */
  setState(state: NodeStateFlags) {
    return dispatchSetState<FieldNode>(this, state);
  }
  /** Interaction flags present on at least one node in the current tree shape. */
  get globalState() {
    return this.runtime.globalState;
  }
  /** Patch interaction flags throughout this live subtree. */
  setSubtreeState(state: NodeStateFlags) {
    return dispatchSetSubtreeState<FieldNode>(this, state);
  }
  /** Clear interaction flags throughout this live subtree. */
  clearSubtreeState() {
    return dispatchClearSubtreeState<FieldNode>(this);
  }
  /** Displayed validator and external issues for this occurrence. */
  get errors() {
    return readFieldNodeErrors<FieldNode>(this);
  }
  /** Ordered whole-tree validator issues. */
  get globalErrors() {
    return this.runtime.globalErrors ?? EMPTY_GLOBAL_ERRORS;
  }
  /** Replace this occurrence's external issues; a non-root write also replaces the root list's issues at this path. */
  setExternalErrors(errors: readonly ValidationIssue[]) {
    return dispatchSetExternalErrors<FieldNode>(this, errors);
  }
  /** Clear this occurrence's external issues; a non-root clear also removes the root list's issues at this path. */
  clearExternalErrors() {
    return dispatchClearExternalErrors<FieldNode>(this);
  }
  /** Request a fresh whole-schema validation verdict. */
  validate() {
    return dispatchValidate<FieldNode>(this);
  }
  /** Subscribe to future event deliveries. */
  subscribe(listener: FieldNodeListener) {
    return subscribeFieldNode<FieldNode>(this, listener);
  }
  /** Resolve the retained value synchronously at this instance's normal keep-policy gate exit; returns cleanup. */
  onInactive(listener: InactiveValueResolver<unknown>) {
    return onInactiveFieldNode<FieldNode>(this, listener);
  }
  /** Read the accumulated delivery revision for selected event bits. */
  revision(mask?: FieldNodeEventType) {
    return readFieldNodeRevision<FieldNode>(this, mask);
  }
  /** Request one renderer action. */
  request(kind: FieldNodeRequestType) {
    return dispatchRequest<FieldNode>(this, kind);
  }
  /** Group synchronous writes in one outer delivery boundary. */
  batch(fn: () => void) {
    return dispatchBatch<FieldNode>(this, fn);
  }
}
