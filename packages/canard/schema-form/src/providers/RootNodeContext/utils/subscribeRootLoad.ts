import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import { FieldNodeEventType } from '@/schema-form/core';

import type { RootLoad, RootLoadStore } from '../type';
import { reportRootLoadValidation } from './reportRootLoadValidation';

/**
 * Relay validation and diagnostics for the prepared current load, even while hidden.
 * @param load - Root whose subscription observes committed aggregate events
 * @param store - Provider-owned validation report retained across root replacements
 * @returns A cleanup function that releases the root subscription
 */
export const subscribeRootLoad = (
  load: RootLoad,
  store: RootLoadStore,
): (() => void) =>
  load.root?.subscribe(({ type }) => {
    if (!load.prepared || load.retired || !load.root) return;
    if (type & FieldNodeEventType.UpdateGlobalError)
      reportRootLoadValidation(load, store);
    if (type & FieldNodeEventType.UpdateDiagnostics)
      load.props.onDiagnosticsChange?.(load.root.diagnostics);
  }) ?? NOOP_FUNCTION;
