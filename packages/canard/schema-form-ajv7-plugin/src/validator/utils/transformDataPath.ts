import type { JsonSchemaError } from '@canard/schema-form';
import { convertJsonPathToPointer } from '@winglet/json/path-common';
import type { ErrorObject } from 'ajv';

const JSON_POINTER_SEPARATOR = '/';

export const transformDataPath = (errors: ErrorObject[]): JsonSchemaError[] => {
  const result = new Array<JsonSchemaError>(errors.length);
  for (let i = 0; i < errors.length; i++) {
    const ajvError = errors[i];
    const dataPath = ajvError.dataPath || '';
    let convertedPath = convertJsonPathToPointer(dataPath);
    if (
      ajvError.keyword === 'required' &&
      ajvError.params &&
      'missingProperty' in ajvError.params
    ) {
      const missingProperty = ajvError.params.missingProperty;
      if (convertedPath === JSON_POINTER_SEPARATOR) {
        // Root level: "/" + "propertyName" = "/propertyName"
        convertedPath = JSON_POINTER_SEPARATOR + missingProperty;
      } else {
        // Nested level: "/path" + "/" + "propertyName" = "/path/propertyName"
        convertedPath =
          convertedPath + JSON_POINTER_SEPARATOR + missingProperty;
      }
    }
    result[i] = {
      path: convertedPath,
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
    };
  }
  return result;
};
