import type { JSONSchema, ValidateFunction } from '../../../src';
import type Ajv from 'ajv';

import { transformErrors } from './utils/transformErrors';

/** Bind synchronous authored-schema validation to a consumer-owned AJV instance. */
export const createValidatorFactory =
  (ajv: Ajv) =>
  (jsonSchema: JSONSchema): ValidateFunction => {
    const validate = ajv.compile(jsonSchema);
    return (data) => validate(data) ? null : transformErrors(validate.errors ?? []);
  };
