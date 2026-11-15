import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Dictionary, Fn, Nullable, Optional } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';
import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';

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
  readFieldNodeIsDivergent,
  readFieldNodeIsMisfit,
  readFieldNodeMisfits,
  readFieldNodeWatchValues,
} from '../../engine';
import type { NodeStateFlags } from '../../engine';
import { readFieldNodeErrors } from '../../engine';
import type { ValidationIssue } from '../../engine';
import { FieldNodeState } from '../../engine';
import { SetValueOption } from '../type';

/** Runtime record implementation; the public FieldNode name denotes a union type. */
export class FieldNode implements FieldNodeRecord<FieldNode> {
  parent: Nullable<FieldNode>;
  childrenByName: Nullable<Dictionary<FieldNode>>;
  itemKey: Nullable<number>;
  itemCount: number;
  nextItemKey: number;

  storedValue: unknown;
  storedOutputValue: unknown;

  schema: EffectiveSchema;
  /** Current output at this path retained by the divergence read memo. */
  divergenceCurrent: unknown;
  /** Concrete path whose parsed segments this occurrence retains. */
  divergencePath: string | undefined;
  /** Parsed path syntax retained until this occurrence changes address. */
  divergenceSegments: readonly PointerSegment[] | undefined;
  /** Last root load output at this path retained by the divergence read memo. */
  divergenceBase: unknown;
  /** Pure comparison result for the retained path values. */
  storedIsDivergent: boolean;

  storedState: FieldNodeRecord<FieldNode>['storedState'];
  interactionEpoch: number;

  /** Per-bit counts copied only after this occurrence first receives delivery. */
  revisionLedger: Readonly<Record<number, number>>;
  isDeliveryInitialized: boolean;
  deliveryChanges: number;
  deliveryPreviousValue: unknown;
  deliveryPreviousOutputValue: unknown;
  deliveryPreviousPath: Optional<string>;
  deliveryPreviousChildren: Optional<Nullable<readonly FieldNode[]>>;
  deliveryPreviousComputedBits: Optional<number>;
  deliveryPreviousSchema: Optional<EffectiveSchema>;
  deliveryPreviousState: Optional<NodeStateFlags>;
  deliveryWatchValues: Optional<readonly unknown[]>;
  pendingDelivery: FieldNodeRecord<FieldNode>['pendingDelivery'];
  pendingRevisionMask: number;
  pendingNonSettleDelivery: FieldNodeRecord<FieldNode>['pendingNonSettleDelivery'];

  private readonly __behavior__: Behavior<FieldNode>;
  private readonly __blueprintNode__: BlueprintNode;
  private readonly __schemaType__: Optional<BlueprintSchemaType>;
  private readonly __isNullable__: boolean;
  private readonly __rootNode__: FieldNode;
  private readonly __runtime__: FieldNodeRuntime<FieldNode>;

  private __depth__: number;
  private __name__: string;
  private __escapedName__: string;
  private __path__: string;
  private __children__: Nullable<readonly FieldNode[]>;

  private __source__: unknown;
  private __extras__: unknown;

  private __isRequired__: boolean;
  private __isActive__: boolean;
  private __isVisible__: boolean;
  private __isReadOnly__: boolean;
  private __isDisabled__: boolean;

  private __isDetached__: boolean;
  private __isDisposed__: boolean;

  constructor(
    behavior: Behavior<FieldNode>,
    runtime: FieldNodeRuntime<FieldNode>,
    blueprintNode: BlueprintNode,
    parent: Nullable<FieldNode>,
    name: string,
    escapedName: string,
    path: string,
    depth: number,
    childrenByName: Nullable<Dictionary<FieldNode>>,
    children: Nullable<readonly FieldNode[]>,
    schema: EffectiveSchema,
    state: FieldNodeRecord<FieldNode>['storedState'],
  ) {
    this.parent = parent;
    this.childrenByName = childrenByName;
    this.itemKey = null;
    this.itemCount = 0;
    this.nextItemKey = 0;
    this.storedValue = undefined;
    this.storedOutputValue = undefined;
    this.schema = schema;
    this.divergenceCurrent = undefined;
    this.divergencePath = undefined;
    this.divergenceSegments = undefined;
    this.divergenceBase = undefined;
    this.storedIsDivergent = false;
    this.storedState = state;
    this.interactionEpoch = 0;
    this.revisionLedger = EMPTY_REVISION_LEDGER;
    this.isDeliveryInitialized = false;
    this.deliveryChanges = BIT_MASK_NONE;
    this.deliveryPreviousValue = undefined;
    this.deliveryPreviousOutputValue = undefined;
    this.deliveryPreviousPath = undefined;
    this.deliveryPreviousChildren = undefined;
    this.deliveryPreviousComputedBits = undefined;
    this.deliveryPreviousSchema = undefined;
    this.deliveryPreviousState = undefined;
    this.deliveryWatchValues = undefined;
    this.pendingDelivery = undefined;
    this.pendingRevisionMask = BIT_MASK_NONE;
    this.pendingNonSettleDelivery = undefined;
    this.__behavior__ = behavior;
    this.__blueprintNode__ = blueprintNode;
    this.__schemaType__ = blueprintNode.schemaType;
    this.__isNullable__ = blueprintNode.isNullable;
    this.__rootNode__ = parent?.rootNode ?? this;
    this.__runtime__ = runtime;
    this.__depth__ = depth;
    this.__name__ = name;
    this.__escapedName__ = escapedName;
    this.__path__ = path;
    this.__children__ = children;
    this.__source__ = undefined;
    this.__extras__ = undefined;
    this.__isRequired__ = false;
    this.__isActive__ = true;
    this.__isVisible__ = true;
    this.__isReadOnly__ = false;
    this.__isDisabled__ = false;
    this.__isDetached__ = false;
    this.__isDisposed__ = false;
  }

  /** Shared calculation row selected for this node kind and strategy. */
  get behavior() {
    return this.__behavior__;
  }
  /** Immutable analysis template for this occurrence. */
  get blueprintNode() {
    return this.__blueprintNode__;
  }
  get type() {
    return this.__behavior__.type;
  }
  get strategy() {
    return this.__behavior__.strategy;
  }
  get schemaType() {
    return this.__schemaType__;
  }
  get jsonSchema() {
    return this.schema.schema;
  }
  get isNullable() {
    return this.__isNullable__;
  }

  get isRoot() {
    return this.parent === null;
  }
  get rootNode() {
    return this.__rootNode__;
  }
  get parentNode() {
    return this.parent;
  }
  get depth() {
    return this.__depth__;
  }
  set depth(value: number) {
    this.__depth__ = value;
  }
  get name() {
    return this.__name__;
  }
  set name(value: string) {
    this.__name__ = value;
  }
  get escapedName() {
    return this.__escapedName__;
  }
  set escapedName(value: string) {
    this.__escapedName__ = value;
  }
  get path() {
    return this.__path__;
  }
  set path(value: string) {
    this.__path__ = value;
  }
  get children() {
    return this.__children__;
  }
  set children(value: Nullable<readonly FieldNode[]>) {
    this.__children__ = value;
  }
  find(pointer?: Nullable<string | readonly string[]>) {
    return find<FieldNode>(this, pointer);
  }
  findNodes(pointer?: Nullable<string | readonly string[]>) {
    return findNodes<FieldNode>(this, pointer);
  }
  /** Visit this occurrence and its current-shape subtree in preorder; writes settle once at the end. */
  visitSubtree(visitor: Fn<[node: FieldNode], void | boolean>) {
    return dispatchVisitSubtree<FieldNode>(this, visitor);
  }

  get source() {
    return this.__source__;
  }
  set source(value: unknown) {
    this.__source__ = value;
  }
  get extras() {
    return this.__extras__;
  }
  set extras(value: unknown) {
    this.__extras__ = value;
  }
  get value() {
    return this.storedValue;
  }
  get outputValue() {
    return this.storedOutputValue;
  }
  get defaultValue() {
    return readFieldNodeDefaultValue<FieldNode>(this);
  }
  get inactiveValues() {
    return readFieldNodeInactiveValues<FieldNode>(this);
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

  /** Effective watched values read from the emitted tree. */
  get watchValues() {
    return readFieldNodeWatchValues<FieldNode>(this);
  }
  /** Whether the effective declaration requires this occurrence. */
  get isRequired() {
    return this.__isRequired__;
  }
  /** Publish the engine decision through the matching record field. @param value - Settled boolean decision. */
  set isRequired(value: boolean) {
    this.__isRequired__ = value;
  }
  /** Whether this occurrence remains in the current shape. */
  get isActive() {
    return this.__isActive__;
  }
  /** Publish the engine decision through the matching record field. @param value - Settled boolean decision. */
  set isActive(value: boolean) {
    this.__isActive__ = value;
  }
  /** Local visibility after active declarations are combined. */
  get isVisible() {
    return this.__isVisible__;
  }
  /** Publish the engine decision through the matching record field. @param value - Settled boolean decision. */
  set isVisible(value: boolean) {
    this.__isVisible__ = value;
  }
  /** Whether this occurrence is active and visible, independent of disabled state. */
  get isPresent() {
    return this.isActive && this.isVisible;
  }
  /** Local read-only state including the standard schema readOnly flag. */
  get isReadOnly() {
    return this.__isReadOnly__;
  }
  /** Publish the engine decision through the matching record field. @param value - Settled boolean decision. */
  set isReadOnly(value: boolean) {
    this.__isReadOnly__ = value;
  }
  /** Local input lock independent of presence. */
  get isDisabled() {
    return this.__isDisabled__;
  }
  /** Publish the engine decision through the matching record field. @param value - Settled boolean decision. */
  set isDisabled(value: boolean) {
    this.__isDisabled__ = value;
  }
  /** Whether the retained source value misses the effective accepted types. */
  get isMisfit() {
    return readFieldNodeIsMisfit<FieldNode>(this);
  }
  get misfits() {
    return readFieldNodeMisfits<FieldNode>(this);
  }
  /** Output difference from the last root load. Re-read on the root node's UpdateValue, UpdateState or RequestRefresh and this node's UpdatePath; rebind when the root or node changes. Both root-load paths deliver RequestRefresh, including a same-output reset. Detached references do not gain new events. */
  get isDivergent(): boolean {
    return readFieldNodeIsDivergent<FieldNode>(this);
  }

  /** Local interaction flags, patched through the dispatcher on assignment. */
  get state() {
    return this.storedState;
  }
  set state(value: NodeStateFlags) {
    dispatchSetState<FieldNode>(this, value);
  }
  /** Patch this occurrence's interaction flags. */
  setState(state: NodeStateFlags) {
    return dispatchSetState<FieldNode>(this, state);
  }
  /** User-input state truthiness; re-read on UpdateState, including for detached references. */
  get isEdited(): boolean {
    return !!this.state[FieldNodeState.Edited];
  }
  /** Blur state truthiness; re-read on UpdateState, including for detached references. */
  get isTouched(): boolean {
    return !!this.state[FieldNodeState.Touched];
  }
  /** Interaction flags present on at least one node in the current tree shape. */
  get globalState() {
    return this.__runtime__.globalState;
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
    return this.__runtime__.globalErrors ?? EMPTY_ARRAY;
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
  batch(fn: Fn) {
    return dispatchBatch<FieldNode>(this, fn);
  }

  /** Per-tree services and settlement records. */
  get runtime() {
    return this.__runtime__;
  }
  /** Shared context reference supplied by the current Form binding. */
  get context() {
    return this.__runtime__.context;
  }
  get diagnostics(): FieldNodeRuntime<FieldNode>['diagnostics'] {
    return this.__runtime__.diagnostics;
  }

  /** Whether this reference has left the live shape. */
  get isDetached() {
    return this.__isDetached__;
  }
  /** Publish the engine decision through the matching record field. @param value - Settled boolean decision. */
  set isDetached(value: boolean) {
    this.__isDetached__ = value;
  }
  /** Whether binding adoption retired this tree; reads retain the preceding commit. */
  get isDisposed() {
    return this.__isDisposed__;
  }
  /** Publish the engine decision through the matching record field. @param value - Settled boolean decision. */
  set isDisposed(value: boolean) {
    this.__isDisposed__ = value;
  }
}
