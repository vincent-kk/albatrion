import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../../../utils/pathIndex/PathKeyedSet';
import type { SlotShadowSession } from '../../types/slotVerification';

/**
 * Construct an independent off tree through the injected engine creator.
 * @param root - Verify root before its first settlement
 * @returns Session owning fresh latent stores and historical identity relations
 */
export const createSlotShadowSession = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): SlotShadowSession<Self> => {
  const source = root.runtime;
  const consumesErrors = source.errorReporter?.hasConsumer() ?? false;
  const runtime: FieldNodeRuntime<Self> = {
    slots: 'off',
    blueprint: source.blueprint,
    nodeFactory: source.nodeFactory,
    diagnostics: { status: 'stable' },
    context: source.context,
    loadSnapshot: source.loadSnapshot,
    unsetOnInactive: source.unsetOnInactive,
    disableAutomaticWrites: source.disableAutomaticWrites,
    validator: source.validator,
    validationMode: source.validationMode,
    deferMountValidation: source.deferMountValidation,
    latentRaw: new PathKeyedMap('pair'),
    inactiveValuesMemo: new PathKeyedMap('path'),
    misfitPaths: new PathKeyedSet(),
    globalStateCounts: new Map(),
    globalState: {},
    pendingWarningRecords: source.pendingWarningRecords
      ? new Map(source.pendingWarningRecords)
      : undefined,
    errorReporter: consumesErrors
      ? { hasConsumer: () => true, report: () => undefined }
      : undefined,
  };
  const shadow = runtime.nodeFactory(root.blueprintNode, null, runtime);
  return {
    actual: root,
    shadow,
    active: false,
    nodes: new Map([[root, shadow]]),
    reverseNodes: new Map([[shadow, root]]),
    references: new WeakMap(),
    reverseReferences: new WeakMap(),
    comparedCommit: 0,
    expectedCommits: [],
  };
};
