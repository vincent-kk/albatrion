import type { DataValidationCxt } from 'ajv/dist/types';

/** AJV8 accepts primitive root data in conditional guard contexts. */
declare module 'ajv/dist/types' {
  interface ValidateFunction<T = unknown> {
    /** Validate JSON data with its actual root value available to $data expressions. */
    (
      data: unknown,
      dataCxt: Omit<DataValidationCxt, 'rootData'> & { rootData: unknown },
    ): data is T;
  }
}
