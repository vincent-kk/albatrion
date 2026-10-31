/** Classify a sampled function using its concrete call site and the diagnostic phase. */
export function categorizeProfileFrame(frame, slotLine, phase) {
  const name = frame.functionName;
  if (/commitFieldNodeRevealPolicy/.test(name)) return 'policy-commit-layout';
  if (
    /useErrorVisibility|resolveErrorVisibility|readFieldNodeReveal|subscribeFieldNodeRevealReleased|useChildFieldErrors/.test(
      name,
    )
  )
    return 'display-hook-and-reveal';
  if (
    /useSyncExternalStore|updateStoreInstance|subscribeToStore|checkIfSnapshotChanged/.test(
      name,
    )
  )
    return 'shared-react-external-store';
  if (
    /FieldProxy|FieldInputSlot/.test(name) ||
    (slotLine >= 0 && frame.lineNumber === slotLine)
  )
    return 'field-proxy-input-render';
  if (
    /Validation|validate\d*$|compile|routeValidation|deliverValidation/.test(
      name,
    )
  )
    return 'validation-schedule-compile-verdict';
  if (
    /buildFieldNode|mountFieldNode|createRootLoad|fieldNodeFactory|loadStaticFirstTree|settleFieldNode|constructFieldNode/.test(
      name,
    )
  )
    return phase === 'burst'
      ? 'engine-write-settle'
      : 'engine-mount-build-settle';
  if (
    /writeFieldNode|dispatchSet|FieldNodeChain|enterFieldNode|exitFieldNode|^setValue$|^setState$|clearExternalErrors/.test(
      name,
    )
  )
    return 'engine-write-settle';
  if (/commit|Passive|flushPendingEffects/.test(name))
    return 'react-commit-passive';
  if (
    /renderWithHooks|beginWork|completeWork|performUnitOfWork|reconcile/.test(
      name,
    )
  )
    return 'react-render-other';
  if (/onCommitFiberRoot/.test(name)) return 'diagnostic-devtools-observer';
  return null;
}
