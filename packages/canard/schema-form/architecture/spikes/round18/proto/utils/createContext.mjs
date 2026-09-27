import { setSwitches } from './operations/setSwitches.mjs';
import { resetCounters } from './operations/resetCounters.mjs';
import { setTrace } from './operations/setTrace.mjs';
import { makeNode } from './operations/makeNode.mjs';
import { enter } from './operations/enter.mjs';
import { leave } from './operations/leave.mjs';
import { leaf } from './operations/leaf.mjs';
import { object } from './operations/object.mjs';
import { array } from './operations/array.mjs';
import { setRoot } from './operations/setRoot.mjs';
import { attach } from './operations/attach.mjs';
import { ensureRoot } from './operations/ensureRoot.mjs';
import { declareFragments } from './operations/declareFragments.mjs';
import { addFragment } from './operations/addFragment.mjs';
import { declareInjections } from './operations/declareInjections.mjs';
import { declareDerived } from './operations/declareDerived.mjs';
import { edgeGated } from './operations/edgeGated.mjs';
import { extrasKeys } from './operations/extrasKeys.mjs';
import { subscribe } from './operations/subscribe.mjs';
import { pathOf } from './operations/pathOf.mjs';
import { touch } from './operations/touch.mjs';
import { stageRaw } from './operations/stageRaw.mjs';
import { rawOf } from './operations/rawOf.mjs';
import { emitOf } from './operations/emitOf.mjs';
import { extrasOf } from './operations/extrasOf.mjs';
import { fragOnOf } from './operations/fragOnOf.mjs';
import { markReplaced } from './operations/markReplaced.mjs';
import { isAbsent } from './operations/isAbsent.mjs';
import { markPresent } from './operations/markPresent.mjs';
import { erase } from './operations/erase.mjs';
import { applyValue } from './operations/applyValue.mjs';
import { applyArray } from './operations/applyArray.mjs';
import { detachLast } from './operations/detachLast.mjs';
import { autoSettle } from './operations/autoSettle.mjs';
import { setValue } from './operations/setValue.mjs';
import { clearNonObjectAncestors } from './operations/clearNonObjectAncestors.mjs';
import { write } from './operations/write.mjs';
import { removeKey } from './operations/removeKey.mjs';
import { push } from './operations/push.mjs';
import { remove } from './operations/remove.mjs';
import { reset } from './operations/reset.mjs';
import { prime } from './operations/prime.mjs';
import { markAll } from './operations/markAll.mjs';
import { batch } from './operations/batch.mjs';
import { cloneFast } from './operations/cloneFast.mjs';
import { normalize } from './operations/normalize.mjs';
import { publish } from './operations/publish.mjs';
import { sortDirty } from './operations/sortDirty.mjs';
import { compute } from './operations/compute.mjs';
import { computeArray } from './operations/computeArray.mjs';
import { sameOn } from './operations/sameOn.mjs';
import { applyActive } from './operations/applyActive.mjs';
import { compose } from './operations/compose.mjs';
import { sweepOnce } from './operations/sweepOnce.mjs';
import { computeObject } from './operations/computeObject.mjs';
import { publishHost } from './operations/publishHost.mjs';
import { deepEqual } from './operations/deepEqual.mjs';
import { resolveDefault } from './operations/resolveDefault.mjs';
import { markSourceLoaded } from './operations/markSourceLoaded.mjs';
import { markSourceWritten } from './operations/markSourceWritten.mjs';
import { clearLoaded } from './operations/clearLoaded.mjs';
import { endEntryScope } from './operations/endEntryScope.mjs';
import { isAncestor } from './operations/isAncestor.mjs';
import { noteCallerWrite } from './operations/noteCallerWrite.mjs';
import { refFragOn } from './operations/refFragOn.mjs';
import { sameValue } from './operations/sameValue.mjs';
import { fires } from './operations/fires.mjs';
import { trackSourceRef } from './operations/trackSourceRef.mjs';
import { hintOrderOf } from './operations/hintOrderOf.mjs';
import { snapshot } from './operations/snapshot.mjs';
import { snapNode } from './operations/snapNode.mjs';
import { restore } from './operations/restore.mjs';
import { restoreItems } from './operations/restoreItems.mjs';
import { retract } from './operations/retract.mjs';
import { autoWrite } from './operations/autoWrite.mjs';
import { isLoaded } from './operations/isLoaded.mjs';
import { wantedDefaults } from './operations/wantedDefaults.mjs';
import { reconcileDerive } from './operations/reconcileDerive.mjs';
import { reconcileTransition } from './operations/reconcileTransition.mjs';
import { autoEntries } from './operations/autoEntries.mjs';
import { payloadOf } from './operations/payloadOf.mjs';
import { valueOrUndefined } from './operations/valueOrUndefined.mjs';
import { commit } from './operations/commit.mjs';
import { settle } from './operations/settle.mjs';
import { isDetached } from './operations/isDetached.mjs';
import { dispatch } from './operations/dispatch.mjs';
import { valueOf } from './operations/valueOf.mjs';
import { localValueOf } from './operations/localValueOf.mjs';
import { activeIds } from './operations/activeIds.mjs';
import { rawTree } from './operations/rawTree.mjs';
import { visitNodes } from './operations/visitNodes.mjs';
import { stagedTree } from './operations/stagedTree.mjs';
import { expressionView } from './operations/expressionView.mjs';
import { evalExpression } from './operations/evalExpression.mjs';
import { existsInShape } from './operations/existsInShape.mjs';
import { wasInShape } from './operations/wasInShape.mjs';
import { clearedInTree } from './operations/clearedInTree.mjs';
import { controlOption } from './operations/controlOption.mjs';
import { combineControls } from './operations/combineControls.mjs';
import { updateControls } from './operations/updateControls.mjs';
import { markAllFresh } from './operations/markAllFresh.mjs';
import { configureSchema } from './operations/configureSchema.mjs';
import { beginExperiment } from './operations/beginExperiment.mjs';
import { experimentTrace } from './operations/experimentTrace.mjs';
import { experimentPriority } from './operations/experimentPriority.mjs';
import { experimentDerive } from './operations/experimentDerive.mjs';

/**
 * Create an isolated prototype runtime and wire mutually reentrant operations without import cycles.
 * @returns {object} Execution state and context-bound operations for one regression runtime.
 */
export function createContext() {
 const context = {};
context.updateEffectiveSpecs = (...args) => updateEffectiveSpecs(context, ...args);
context.reconcileInterpretation = (...args) => reconcileInterpretation(context, ...args);
context.countTransitionBudget = (...args) => countTransitionBudget(context, ...args);
context.reconcileRankedWrites = (...args) => reconcileRankedWrites(context, ...args);
context.reconcileExits = (...args) => reconcileExits(context, ...args);
context.projectArrayItem = (...args) => projectArrayItem(context, ...args);
context.setSwitches = (...args) => setSwitches(context, ...args);
context.resetCounters = (...args) => resetCounters(context, ...args);
context.setTrace = (...args) => setTrace(context, ...args);
context.makeNode = (...args) => makeNode(context, ...args);
context.enter = (...args) => enter(context, ...args);
context.leave = (...args) => leave(context, ...args);
context.leaf = (...args) => leaf(context, ...args);
context.object = (...args) => object(context, ...args);
context.array = (...args) => array(context, ...args);
context.setRoot = (...args) => setRoot(context, ...args);
context.attach = (...args) => attach(context, ...args);
context.ensureRoot = (...args) => ensureRoot(context, ...args);
context.declareFragments = (...args) => declareFragments(context, ...args);
context.addFragment = (...args) => addFragment(context, ...args);
context.declareInjections = (...args) => declareInjections(context, ...args);
context.declareDerived = (...args) => declareDerived(context, ...args);
context.edgeGated = (...args) => edgeGated(context, ...args);
context.extrasKeys = (...args) => extrasKeys(context, ...args);
context.subscribe = (...args) => subscribe(context, ...args);
context.pathOf = (...args) => pathOf(context, ...args);
context.touch = (...args) => touch(context, ...args);
context.stageRaw = (...args) => stageRaw(context, ...args);
context.rawOf = (...args) => rawOf(context, ...args);
context.emitOf = (...args) => emitOf(context, ...args);
context.extrasOf = (...args) => extrasOf(context, ...args);
context.fragOnOf = (...args) => fragOnOf(context, ...args);
context.markReplaced = (...args) => markReplaced(context, ...args);
context.isAbsent = (...args) => isAbsent(context, ...args);
context.markPresent = (...args) => markPresent(context, ...args);
context.erase = (...args) => erase(context, ...args);
context.applyValue = (...args) => applyValue(context, ...args);
context.applyArray = (...args) => applyArray(context, ...args);
context.detachLast = (...args) => detachLast(context, ...args);
context.autoSettle = (...args) => autoSettle(context, ...args);
context.setValue = (...args) => setValue(context, ...args);
context.clearNonObjectAncestors = (...args) => clearNonObjectAncestors(context, ...args);
context.write = (...args) => write(context, ...args);
context.removeKey = (...args) => removeKey(context, ...args);
context.push = (...args) => push(context, ...args);
context.remove = (...args) => remove(context, ...args);
context.reset = (...args) => reset(context, ...args);
context.prime = (...args) => prime(context, ...args);
context.markAll = (...args) => markAll(context, ...args);
context.batch = (...args) => batch(context, ...args);
context.cloneFast = (...args) => cloneFast(context, ...args);
context.normalize = (...args) => normalize(context, ...args);
context.publish = (...args) => publish(context, ...args);
context.sortDirty = (...args) => sortDirty(context, ...args);
context.compute = (...args) => compute(context, ...args);
context.computeArray = (...args) => computeArray(context, ...args);
context.sameOn = (...args) => sameOn(context, ...args);
context.applyActive = (...args) => applyActive(context, ...args);
context.compose = (...args) => compose(context, ...args);
context.sweepOnce = (...args) => sweepOnce(context, ...args);
context.computeObject = (...args) => computeObject(context, ...args);
context.publishHost = (...args) => publishHost(context, ...args);
context.deepEqual = (...args) => deepEqual(context, ...args);
context.resolveDefault = (...args) => resolveDefault(context, ...args);
context.markSourceLoaded = (...args) => markSourceLoaded(context, ...args);
context.markSourceWritten = (...args) => markSourceWritten(context, ...args);
context.clearLoaded = (...args) => clearLoaded(context, ...args);
context.endEntryScope = (...args) => endEntryScope(context, ...args);
context.isAncestor = (...args) => isAncestor(context, ...args);
context.noteCallerWrite = (...args) => noteCallerWrite(context, ...args);
context.refFragOn = (...args) => refFragOn(context, ...args);
context.sameValue = (...args) => sameValue(context, ...args);
context.fires = (...args) => fires(context, ...args);
context.trackSourceRef = (...args) => trackSourceRef(context, ...args);
context.hintOrderOf = (...args) => hintOrderOf(context, ...args);
context.snapshot = (...args) => snapshot(context, ...args);
context.snapNode = (...args) => snapNode(context, ...args);
context.restore = (...args) => restore(context, ...args);
context.restoreItems = (...args) => restoreItems(context, ...args);
context.retract = (...args) => retract(context, ...args);
context.autoWrite = (...args) => autoWrite(context, ...args);
context.isLoaded = (...args) => isLoaded(context, ...args);
context.wantedDefaults = (...args) => wantedDefaults(context, ...args);
context.reconcileDerive = (...args) => reconcileDerive(context, ...args);
context.reconcileTransition = (...args) => reconcileTransition(context, ...args);
context.autoEntries = (...args) => autoEntries(context, ...args);
context.payloadOf = (...args) => payloadOf(context, ...args);
context.valueOrUndefined = (...args) => valueOrUndefined(context, ...args);
context.commit = (...args) => commit(context, ...args);
context.settle = (...args) => settle(context, ...args);
context.isDetached = (...args) => isDetached(context, ...args);
context.dispatch = (...args) => dispatch(context, ...args);
context.valueOf = (...args) => valueOf(context, ...args);
context.localValueOf = (...args) => localValueOf(context, ...args);
context.activeIds = (...args) => activeIds(context, ...args);
context.rawTree = (...args) => rawTree(context, ...args);
context.visitNodes = (...args) => visitNodes(context, ...args);
context.stagedTree = (...args) => stagedTree(context, ...args);
context.expressionView = (...args) => expressionView(context, ...args);
context.evalExpression = (...args) => evalExpression(context, ...args);
context.existsInShape = (...args) => existsInShape(context, ...args);
context.wasInShape = (...args) => wasInShape(context, ...args);
context.clearedInTree = (...args) => clearedInTree(context, ...args);
context.controlOption = (...args) => controlOption(context, ...args);
context.combineControls = (...args) => combineControls(context, ...args);
context.updateControls = (...args) => updateControls(context, ...args);
context.markAllFresh = (...args) => markAllFresh(context, ...args);
context.configureSchema = (...args) => configureSchema(context, ...args);
context.beginExperiment = (...args) => beginExperiment(context, ...args);
context.experimentTrace = (...args) => experimentTrace(context, ...args);
context.experimentPriority = (...args) => experimentPriority(context, ...args);
context.experimentDerive = (...args) => experimentDerive(context, ...args);
context.MISSING = Symbol('missing');
context.NOREPORT = Symbol('noreport');
context.ROUND_CAP = 25;
context.WAVE_CAP = 25;
context.REFRESH = 1;
context.SWITCHES = {
  EXPERIMENT: false,
  CLEAR_PRIORITY: 'clear-wins',
  LOSER_FATE: 'dropped',
  EDGE_CONSUMED_ON_LOSS: true,
  LOAD_EDGE_CLEAR: 'held',
  FINAL_SHAPE: true,
  AUTO_SCOPE: 'settle',
  EDGE_REF: 'entry',
  INJECT_TO_EDGE: true,
  LOAD_EDGE: 'fire',
  ORDER_HINT: false,
  DERIVED_MODE: 'edge',
  EDGE_COMPARE: 'value',
  DEFAULT_WINNER: 'last',
  COMMIT_ON_BUDGET: 'base',
  ROUND_CAP: context.ROUND_CAP,
  EXTRAS_ORDER: 'insertion',
  DERIVE_ORDER: ['derived', 'injectTo', 'clearValue'],
  WRITE_CONFLICT: 'last',
  CONTROL_COMBINE: 'and-or',
  NODE_GATE_UNIT: 'shape'
};
context.OLD_SWITCHES = Object.freeze({
  ...context.SWITCHES,
  FINAL_SHAPE: false,
  EDGE_REF: 'commit',
  INJECT_TO_EDGE: false,
  COMMIT_ON_BUDGET: 'lastRound'
});
context.NEW_SWITCHES = Object.freeze({
  ...context.SWITCHES
});
context.counters = {
  visited: 0,
  guards: 0,
  composes: 0,
  rebuilds: 0,
  copies: 0,
  normalizes: 0,
  sweeps: 0,
  rounds: 0,
  settles: 0,
  injections: 0,
  waves: 0,
  notifications: 0,
  entries: 0,
  onChange: 0,
  validations: 0,
  retractions: 0
};
context.lastSettle = {
  rounds: 0,
  sweeps: 0,
  budgetExceeded: false,
  hostExceeded: false,
  maxSweepsOnOneHost: 0,
  injected: [],
  refreshed: [],
  waves: 0,
  wavesExceeded: false,
  delivered: [],
  errors: [],
  budgetWhich: '',
  retracted: [],
  budgetCommit: '',
  autoAtCommit: []
};
context.lastEntry = {
  settles: 0,
  waves: 0,
  onChange: false,
  validation: false,
  commit: 0,
  onChangeDepth: 0,
  onChangeCapExceeded: false,
  aborted: false
};
context.SID = 0;
context.batchDepth = 0;
context.stagingDepth = 0;
context.trace = false;
context.inSettle = false;
context.loadDepth = 0;
context.EMPTY_KEYS = Object.freeze([]);
context.EMPTY_LOCAL = Object.freeze({});
context.controlKeys = ['active', 'visible', 'readOnly', 'disabled'];
 return context;
}
import { updateEffectiveSpecs } from './operations/updateEffectiveSpecs.mjs';
import { reconcileInterpretation } from './operations/reconcileInterpretation.mjs';
import { countTransitionBudget } from './operations/countTransitionBudget.mjs';
import { reconcileRankedWrites } from './operations/reconcileRankedWrites.mjs';
import { reconcileExits } from './operations/reconcileExits.mjs';
import { projectArrayItem } from './operations/projectArrayItem.mjs';
