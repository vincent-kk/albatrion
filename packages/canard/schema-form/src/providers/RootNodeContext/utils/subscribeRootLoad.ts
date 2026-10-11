import { SchemaNodeEventType } from '@/schema-form/core';

import type { RootLoad } from '../type';

/** Relay aggregate validation and diagnostics only after preparation. */
export const subscribeRootLoad = (load: RootLoad): (() => void) =>
  load.root?.subscribe(({ type }) => {
    if (!load.ready || !load.root) return;
    if (type & SchemaNodeEventType.UpdateGlobalError)
      load.props.onValidate?.(load.root.globalErrors);
    if (type & SchemaNodeEventType.UpdateDiagnostics)
      load.props.onDiagnosticsChange?.(load.root.diagnostics);
  }) ?? (() => {});
