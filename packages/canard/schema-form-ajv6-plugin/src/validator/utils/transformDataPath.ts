import type { JsonSchemaError } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

const JSON_PATH_SEPARATOR = '.';
const JSON_POINTER_SEPARATOR = '/';

/**
 * Converts AJV dataPath format to JSONPointer format.
 *
 * @param ajvDataPath - AJV dataPath string to convert (e.g., "data.users[0].name")
 * @returns JSONPointer format string (e.g., "/data/users/0/name")
 */
const convertJsonPathToJsonPointer = (ajvDataPath: string): string => {
  if (!ajvDataPath) return JSON_POINTER_SEPARATOR;
  let index = 0;
  let result = '';
  while (index < ajvDataPath.length) {
    const character = ajvDataPath[index];
    if (character === JSON_PATH_SEPARATOR) {
      result += JSON_POINTER_SEPARATOR;
      index++;
    } else if (character === '[') {
      index++;
      result += JSON_POINTER_SEPARATOR;
      while (index < ajvDataPath.length && ajvDataPath[index] !== ']') {
        result += ajvDataPath[index];
        index++;
      }
      if (index < ajvDataPath.length && ajvDataPath[index] === ']') {
        index++;
      }
    } else {
      result += character;
      index++;
    }
  }
  return result[0] === JSON_POINTER_SEPARATOR
    ? result
    : JSON_POINTER_SEPARATOR + result;
};

export const transformDataPath = (errors: ErrorObject[]): JsonSchemaError[] => {
  const result = new Array<JsonSchemaError>(errors.length);
  for (let i = 0; i < errors.length; i++) {
    const ajvError = errors[i];
    const dataPath = ajvError.dataPath || '';
    let convertedDataPath = convertJsonPathToJsonPointer(dataPath);
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
