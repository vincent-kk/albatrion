import type { Fn } from '@aileron/declare';

import type { PathManager } from '../getPathManager';

/** Compile value or boolean expressions against a caller-owned path registry. */
export interface CreateDynamicFunction {
  (
    pathManager: PathManager,
    fieldName: string,
    rawExpression: string | undefined,
    coerceToBoolean: true,
  ): DynamicFunction<boolean> | undefined;
  <ReturnType = any>(
    pathManager: PathManager,
    fieldName: string,
    rawExpression: string | undefined,
    coerceToBoolean?: false,
  ): DynamicFunction<ReturnType> | undefined;
}

/** Compiled expression using dependencies in registration order. */
export type DynamicFunction<ReturnType = any> = Fn<
  [dependencies: unknown[]],
  ReturnType
>;
