import type { PathManager } from '../getPathManager';
import type { DynamicFunction } from '../type';

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
