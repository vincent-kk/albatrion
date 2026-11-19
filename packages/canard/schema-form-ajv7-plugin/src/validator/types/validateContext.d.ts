import type { DataValidationCxt } from 'ajv/dist/types';

/** AJV7 accepts primitive root data at runtime, including in conditional guard contexts. */
declare module 'ajv/dist/types' {
  interface ValidateFunction<T = unknown> {
    /** Validate any JSON value with the actual root value available to $data expressions. */
    (
      data: unknown,
      dataCxt: Omit<DataValidationCxt, 'rootData'> & { rootData: unknown },
    ): data is T;
  }
}
