import type { Fn } from '@aileron/declare';

import type { PathManager } from '../getPathManager';

export type DynamicFunction<ReturnType = any> = Fn<
  [dependencies: unknown[]],
  ReturnType
>;

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
