import type { SchemaNodeRecord } from '../../../record';

/** Stable empty form list when neither error channel has issues. */
const EMPTY_GLOBAL_ERRORS: readonly { dataPath: string }[] = Object.freeze([]);

/**
 * Store the form list after either root external or routed validator issues change.
 * @param root - Live form root owning both error channels.
 * @returns Nothing; getters read the stored external-first list without allocation.
 */
export const updateSchemaNodeGlobalErrors = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const external = runtime.nodeErrors?.get(root);
  const validation = runtime.routedValidationErrors;
  runtime.globalErrors = external?.length
    ? validation?.length ? [...external, ...validation] : external
    : validation ?? EMPTY_GLOBAL_ERRORS;
};
