import type { JsonSchemaError } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

export const transformDataPath = (errors: ErrorObject[]): JsonSchemaError[] => {
  const result = new Array<JsonSchemaError>(errors.length);
  for (let i = 0; i < errors.length; i++) {
    const ajvError = errors[i];
    result[i] = {
      dataPath: ajvError.dataPath || '',
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
    };
    if (
      ajvError.keyword === 'required' &&
      'missingProperty' in ajvError.params
    ) {
      const dataPath = ajvError.dataPath || '';
      result[i].dataPath = dataPath
        ? dataPath + '.' + ajvError.params.missingProperty
        : '.' + ajvError.params.missingProperty;
    }
  }
  return result;
};
