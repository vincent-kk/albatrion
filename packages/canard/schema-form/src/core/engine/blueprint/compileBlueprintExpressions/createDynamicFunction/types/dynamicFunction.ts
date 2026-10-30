import type { Fn, Optional } from '@aileron/declare';

import type { PathManager } from '../../getPathManager';

/** Compile value or boolean expressions against a caller-owned path registry. */
export interface CreateDynamicFunction {
  (
    pathManager: PathManager,
    fieldName: string,
    rawExpression: Optional<string>,
    coerceToBoolean: true,
  ): Optional<DynamicFunction<boolean>>;
  <ReturnType = any>(
    pathManager: PathManager,
    fieldName: string,
    rawExpression: Optional<string>,
    coerceToBoolean?: false,
  ): Optional<DynamicFunction<ReturnType>>;
}

/** Compiled expression using dependencies in registration order. */
export type DynamicFunction<ReturnType = any> = Fn<
  [dependencies: unknown[]],
  ReturnType
>;
