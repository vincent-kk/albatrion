import type { JsonSchemaError } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

/**
 * JSONPath 형태의 dataPath를 JSONPointer 형태로 변환합니다.
 *
 * @param jsonPath - 변환할 JSONPath 문자열 (예: "data.users[0].name")
 * @returns JSONPointer 형태의 문자열 (예: "/data/users/0/name")
 */
const convertJsonPathToJsonPointer = (jsonPath: string): string => {
  if (!jsonPath) return '';

  const result: string[] = ['/'];
  let index = 0;

  while (index < jsonPath.length) {
    const character = jsonPath[index];
    if (character === '.') {
      result[result.length] = '/';
      index++;
    } else if (character === '[') {
      index++;
      result[result.length] = '/';
      while (index < jsonPath.length && jsonPath[index] !== ']') {
        result[result.length] = jsonPath[index];
        index++;
      }
      if (index < jsonPath.length && jsonPath[index] === ']') index++;
    } else {
      result[result.length] = character;
      index++;
    }
  }

  return result.join('');
};

export const transformDataPath = (errors: ErrorObject[]): JsonSchemaError[] => {
  const result = new Array<JsonSchemaError>(errors.length);
  for (let i = 0; i < errors.length; i++) {
    const ajvError = errors[i];
    const dataPath = ajvError.dataPath || '';

    result[i] = {
      dataPath: convertJsonPathToJsonPointer(dataPath),
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
    };

    if (
      ajvError.keyword === 'required' &&
      'missingProperty' in ajvError.params
    ) {
      const convertedDataPath = convertJsonPathToJsonPointer(dataPath);
      result[i].dataPath = convertedDataPath
        ? convertedDataPath + '/' + ajvError.params.missingProperty
        : '/' + ajvError.params.missingProperty;
    }
  }
  return result;
};
