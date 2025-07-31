import type { JsonSchemaError } from '@canard/schema-form';
import { convertJsonPathToPointer } from '@winglet/json/path-common';
import type { ErrorObject } from 'ajv';

const JSON_POINTER_SEPARATOR = '/';

export const transformDataPath = (errors: ErrorObject[]): JsonSchemaError[] => {
  const result = new Array<JsonSchemaError>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    const dataPath = ajvError.dataPath || '';
    let convertedDataPath = convertJsonPathToPointer(dataPath);
    if (
      ajvError.keyword === 'required' &&
      ajvError.params &&
      'missingProperty' in ajvError.params
    ) {
      const missingProperty = ajvError.params.missingProperty;
      if (convertedDataPath === JSON_POINTER_SEPARATOR) {
        // Root level: "/" + "propertyName" = "/propertyName"
        convertedDataPath = JSON_POINTER_SEPARATOR + missingProperty;
      } else {
        // Nested level: "/path" + "/" + "propertyName" = "/path/propertyName"
        convertedDataPath =
          convertedDataPath + JSON_POINTER_SEPARATOR + missingProperty;
      }
    }
    result[i] = {
      dataPath: convertedDataPath,
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
    };
  }
  return result;
};
