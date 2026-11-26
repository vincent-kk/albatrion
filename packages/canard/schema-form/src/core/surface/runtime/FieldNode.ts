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

/**
 * Runtime record implementation; the public FieldNode name denotes a union type.
 *
 * Field forms follow rule 8 of NAMING_CONVENTIONS.md: every internal field is named `__name__`, so a
 * node shows its internal fields apart from its public members at runtime. A `private` field is one
 * that only this class touches; other code reaches it through the accessor of the same name. A field
 * without `private` is a `FieldNodeRecord` slot that engine modules read and write directly; the
 * public node types do not declare it. A slot behind a public member takes that member's name
 * (`__value__` behind `value`, `__state__` behind `state`) and carries no marker word.
 */
export class FieldNode implements FieldNodeRecord<FieldNode> {
  /** Structural parent, null only at the root; engine traversals walk it, and consumers read it as `parentNode`. */
  __parent__: Nullable<FieldNode>;
  /** Direct children of the last committed shape, keyed by name. */
  __childrenByName__: Nullable<Dictionary<FieldNode>>;
  /** Creation-order nonce of an array item; null on nodes that are not array items. */
  __itemKey__: Nullable<number>;
  /** Number of positions an array host holds, including positions without a template. */
  __itemCount__: number;
  /** Next creation-order nonce this array host hands out. */
  __nextItemKey__: number;

  /** Backing field for `value`, written directly by the engine. */
  __value__: unknown;
  /** Backing field for `outputValue`, written directly by the engine. */
  __outputValue__: unknown;

  /** Effective schema merged from the active declarations; `jsonSchema` reads its `schema`. */
  __schema__: EffectiveSchema;
  /** Current output at this path retained by the divergence read memo. */
  __divergenceCurrent__: unknown;
  /** Concrete path whose parsed segments this occurrence retains. */
  __divergencePath__: string | undefined;
  /** Parsed path syntax retained until this occurrence changes address. */
  __divergenceSegments__: readonly PointerSegment[] | undefined;
  /** Last root load output at this path retained by the divergence read memo. */
  __divergenceBase__: unknown;
  /** Backing field for `isDivergent`: the memoized comparison, reused while `__divergenceCurrent__` and `__divergenceBase__` keep their identities. */
  __isDivergent__: boolean;
  /** Last default tuple of a virtual group, reused while unchanged; initialized on every kind so all nodes share one layout. */
  __virtualDefaultValue__: Optional<readonly unknown[]>;
  /** Last watch values read for this node with their commit, reused while unchanged; initialized on every kind so all nodes share one layout. */
  __watchValues__: FieldNodeRecord<FieldNode>['__watchValues__'];

  /** Backing field for `state`: interaction flags the engine replaces directly, whereas the public `state` setter dispatches a patch. */
  __state__: FieldNodeRecord<FieldNode>['__state__'];
  /** Raised each time this node's interaction state is cleared, so deferred touched callbacks from an earlier lifetime are dropped. */
  __interactionEpoch__: number;

  /** Per-bit counts copied only after this occurrence first receives delivery. */
  __revisionLedger__: Readonly<Record<number, number>>;
  /** Whether the first delivery comparison has run; change capture starts only after it. */
  __isDeliveryInitialized__: boolean;
  /** Event bits whose pre-change baseline this commit has already captured. */
  __deliveryChanges__: number;
  /** `__value__` before this commit's first value change. */
  __deliveryPreviousValue__: unknown;
  /** `__outputValue__` before this commit's first value change. */
  __deliveryPreviousOutputValue__: unknown;
  /** Path before this commit's first rekey. */
  __deliveryPreviousPath__: Optional<string>;
  /** Child array before this commit's first shape change. */
  __deliveryPreviousChildren__: Optional<Nullable<readonly FieldNode[]>>;
  /** Packed isActive, isVisible, isReadOnly and isDisabled before their first change in this commit. */
  __deliveryPreviousComputedBits__: Optional<number>;
  /** Effective schema before this commit's first schema change. */
  __deliveryPreviousSchema__: Optional<EffectiveSchema>;
  /** Interaction flags before settlement clears or patches them; a direct state dispatch moves this baseline forward. */
  __deliveryPreviousState__: Optional<NodeStateFlags>;
  /** Watch values from the last comparison; set only on declared watch targets. */
  __deliveryWatchValues__: Optional<readonly unknown[]>;
  /** Event bits and payloads waiting for the next settlement delivery wave. */
  __pendingDelivery__: FieldNodeRecord<FieldNode>['__pendingDelivery__'];
  /** Revision bits to advance once at this commit, whether or not anyone listens. */
  __pendingRevisionMask__: number;
  /** State and command events waiting for their own delivery wave, apart from settlement. */
  __pendingNonSettleDelivery__: FieldNodeRecord<FieldNode>['__pendingNonSettleDelivery__'];

  /** Backing field for `behavior`. */
  private readonly __behavior__: Behavior<FieldNode>;
  /** Backing field for `blueprintNode`. */
  private readonly __blueprintNode__: BlueprintNode;
  /** Backing field for `schemaType`. */
  private readonly __schemaType__: Optional<BlueprintSchemaType>;
  /** Backing field for `isNullable`. */
  private readonly __isNullable__: boolean;
  /** Backing field for `rootNode`. */
  private readonly __rootNode__: FieldNode;
  /** Backing field for `runtime`. */
  private readonly __runtime__: FieldNodeRuntime<FieldNode>;

  /** Backing field for `depth`. */
  private __depth__: number;
  /** Backing field for `name`. */
  private __name__: string;
  /** Backing field for `escapedName`. */
  private __escapedName__: string;
  /** Backing field for `path`. */
  private __path__: string;
  /** Backing field for `children`. */
  private __children__: Nullable<readonly FieldNode[]>;

  /** Backing field for `source`. */
  private __source__: unknown;
  /** Backing field for `extras`. */
  private __extras__: unknown;

  /** Backing field for `isRequired`. */
  private __isRequired__: boolean;
  /** Backing field for `isActive`. */
  private __isActive__: boolean;
  /** Backing field for `isVisible`. */
  private __isVisible__: boolean;
  /** Backing field for `isReadOnly`. */
  private __isReadOnly__: boolean;
  /** Backing field for `isDisabled`. */
  private __isDisabled__: boolean;

  /** Backing field for `isDetached`. */
  private __isDetached__: boolean;
  /** Backing field for `isDisposed`. */
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
    state: FieldNodeRecord<FieldNode>['__state__'],
  ) {
    this.__parent__ = parent;
    this.__childrenByName__ = childrenByName;
    this.__itemKey__ = null;
    this.__itemCount__ = 0;
    this.__nextItemKey__ = 0;
    this.__value__ = undefined;
    this.__outputValue__ = undefined;
    this.__schema__ = schema;
    this.__divergenceCurrent__ = undefined;
    this.__divergencePath__ = undefined;
    this.__divergenceSegments__ = undefined;
    this.__divergenceBase__ = undefined;
    this.__isDivergent__ = false;
    this.__virtualDefaultValue__ = undefined;
    this.__watchValues__ = undefined;
    this.__state__ = state;
    this.__interactionEpoch__ = 0;
    this.__revisionLedger__ = EMPTY_REVISION_LEDGER;
    this.__isDeliveryInitialized__ = false;
    this.__deliveryChanges__ = BIT_MASK_NONE;
    this.__deliveryPreviousValue__ = undefined;
    this.__deliveryPreviousOutputValue__ = undefined;
    this.__deliveryPreviousPath__ = undefined;
    this.__deliveryPreviousChildren__ = undefined;
    this.__deliveryPreviousComputedBits__ = undefined;
    this.__deliveryPreviousSchema__ = undefined;
    this.__deliveryPreviousState__ = undefined;
    this.__deliveryWatchValues__ = undefined;
    this.__pendingDelivery__ = undefined;
    this.__pendingRevisionMask__ = BIT_MASK_NONE;
    this.__pendingNonSettleDelivery__ = undefined;
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
  /** Node kind that discriminates the public node union. */
  get type() {
    return this.__behavior__.type;
  }
  /** Whether this node manages child nodes (`'branch'`) or holds its whole value itself (`'terminal'`). */
  get strategy() {
    return this.__behavior__.strategy;
  }
  /** JSON types the static declaration allows, fixed at analysis and undefined on virtual nodes; not the gated `jsonSchema.type`. */
  get schemaType() {
    return this.__schemaType__;
  }
  /** Effective JSON Schema merged from the currently active declarations. */
  get jsonSchema() {
    return this.__schema__.schema;
  }
  /** Whether the fixed type permits null, through `type: [..., 'null']` or `nullable: true`. */
  get isNullable() {
    return this.__isNullable__;
  }

  /** Whether this node is the root, the only node without a parent. */
  get isRoot() {
    return this.__parent__ === null;
  }
  /** Root of the tree this node was created in, kept after the node detaches. */
  get rootNode() {
    return this.__rootNode__;
  }
  /** Structural parent, or null at the root. */
  get parentNode() {
    return this.__parent__;
  }
  /** Number of structural edges from the root. */
  get depth() {
    return this.__depth__;
  }
  /** Publish the engine's new depth through the matching record field. @param value - Edge count from the root. */
  set depth(value: number) {
    this.__depth__ = value;
  }
  /** Unescaped name within the parent. */
  get name() {
    return this.__name__;
  }
  /** Publish the engine's new name through the matching record field. @param value - Unescaped name within the parent. */
  set name(value: string) {
    this.__name__ = value;
  }
  /** Name within the parent, escaped for JSON Pointer. */
  get escapedName() {
    return this.__escapedName__;
  }
  /** Publish the engine's new escaped name through the matching record field. @param value - JSON Pointer-escaped name. */
  set escapedName(value: string) {
    this.__escapedName__ = value;
  }
  /** Canonical absolute JSON Pointer of this occurrence; re-read on UpdatePath. */
  get path() {
    return this.__path__;
  }
  /** Publish the engine's new path through the matching record field. @param value - Canonical absolute JSON Pointer. */
  set path(value: string) {
    this.__path__ = value;
  }
  /** Direct children in the last committed shape; null on terminal nodes. */
  get children() {
    return this.__children__;
  }
  /** Publish the engine's committed child array through the matching record field. @param value - Children of the new shape, or null on terminal nodes. */
  set children(value: Nullable<readonly FieldNode[]>) {
    this.__children__ = value;
  }
  find(pointer?: Nullable<string | readonly string[]>) {
    return find<FieldNode>(this, pointer);
  }
  findNodes(pointer?: Nullable<string | readonly string[]>) {
    return findNodes<FieldNode>(this, pointer);
  }
  /** Visit this occurrence and its current-shape subtree in preorder; value writes settle once at the end, as in `batch`. */
  visitSubtree(visitor: Fn<[node: FieldNode], void | boolean>) {
    return dispatchVisitSubtree<FieldNode>(this, visitor);
  }

  /** Interpreted terminal source or a branch's non-plain source; an input of value calculation. */
  get source() {
    return this.__source__;
  }
  /** Publish the engine's interpreted source through the matching record field. @param value - New source. */
  set source(value: unknown) {
    this.__source__ = value;
  }
  /** Undeclared object keys retained in incoming own-key order. */
  get extras() {
    return this.__extras__;
  }
  /** Publish the engine's retained extras through the matching record field. @param value - Undeclared object keys. */
  set extras(value: unknown) {
    this.__extras__ = value;
  }
  /** Current local value before output projection; write it through `setValue` or the array commands. */
  get value() {
    return this.__value__;
  }
  /** Value after the schema options project it, such as `omitTrailingEmpty` trimming; the root's is the form's submitted value. */
  get outputValue() {
    return this.__outputValue__;
  }
  /** Source at this path in the form's load snapshot, unaffected by later caller writes. */
  get defaultValue() {
    return readFieldNodeDefaultValue<FieldNode>(this);
  }
  /** Values kept for inactive descendants as path and value pairs in document order; a detached reference reads its final commit. */
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
  /** Paths in this subtree whose retained source misses the accepted types; a detached reference reads its final commit. */
  get misfits() {
    return readFieldNodeMisfits<FieldNode>(this);
  }
  /** Output difference from the last root load. Re-read on the root node's UpdateValue, UpdateState or RequestRefresh and this node's UpdatePath; rebind when the root or node changes. Both root-load paths deliver RequestRefresh, including a same-output reset. Detached references do not gain new events. */
  get isDivergent(): boolean {
    return readFieldNodeIsDivergent<FieldNode>(this);
  }

  /** Local interaction flags, patched through the dispatcher on assignment. */
  get state() {
    return this.__state__;
  }
  /** Dispatch a shallow patch of the interaction flags, like `setState`. @param value - Flags to merge. */
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
  /** Settlement health of the whole tree, retained until the next form-level load. */
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
