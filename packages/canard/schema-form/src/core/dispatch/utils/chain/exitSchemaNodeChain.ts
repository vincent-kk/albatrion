import { FEEDBACK_LIMIT_EXCEEDED, MULTIPLE_ERRORS,
  SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { runDeliveryWaves } from './runDeliveryWaves';
import { resolveSchemaNodeChainRoot } from './resolveSchemaNodeChainRoot';

/**
 * Bundle failures until U5b supplies the reporter's full record path.
 * @param errors - Failures in their occurrence order
 * @returns The original failure or a SchemaFormError aggregate
 */
const aggregateDispatchErrors = (errors: readonly unknown[]): unknown =>
  errors.length === 1 ? errors[0] : new SchemaFormError(MULTIPLE_ERRORS,
    'Multiple dispatch errors', { errors });

/**
 * Exit one public write and finish the outermost chain in contract order.
 * @param node - Record whose runtime owns this active stack
 * @param failure - Caught settlement or user callback failure, if present
 * @returns Nothing; the chain may throw its single failure or aggregate
 */
export const exitSchemaNodeChain = <Self extends SchemaNodeRecord<Self>>(
  node: Self, failure?: unknown,
): void => {
  const activeRoot = resolveSchemaNodeChainRoot(node.rootNode);
  const runtime = activeRoot.runtime;
  if (failure !== undefined) runtime.chainErrors?.push(failure);
  if ((runtime.entryDepth ?? 0) > 1) {
    runtime.entryDepth = (runtime.entryDepth ?? 0) - 1;
    return;
  }
  const root = runtime.chainRoot ?? activeRoot;
  runDeliveryWaves(root);
  const changed = runtime.chainInitialEmit !== root.emit;
  const requests = runtime.validationTargets;
  if (runtime.validationMode && runtime.validationMode & ValidationMode.OnChange) {
    if (changed && !requests?.has(root)) {
      try { runtime.requestValidation?.(root); }
      catch (error) { runtime.chainErrors?.push(error); }
    }
    for (const target of requests ?? []) {
      try { runtime.requestValidation?.(target); }
      catch (error) { runtime.chainErrors?.push(error); }
    }
  }
  runtime.validationTargets = undefined;
  runtime.entryDepth = 0;
  const errors = runtime.chainErrors ?? [];
  if (changed && runtime.onChange) {
    if ((runtime.onChangeBudget ?? 0) >= 25)
      errors.push(new SchemaFormError(FEEDBACK_LIMIT_EXCEEDED,
        'onChange nesting exceeded 25 callbacks'));
    else {
      runtime.onChangeBudget = (runtime.onChangeBudget ?? 0) + 1;
      try { runtime.onChange(root.emit); }
      catch (error) { errors.push(error); }
      finally { runtime.onChangeBudget -= 1; }
    }
  }
  runtime.chainErrors = undefined;
  runtime.chainRoot = undefined;
  runtime.feedbackBudget = 0;
  runtime.feedbackBlockedListeners = undefined;
  runtime.feedbackLimitReported = false;
  if (errors.length) throw aggregateDispatchErrors(errors);
};
