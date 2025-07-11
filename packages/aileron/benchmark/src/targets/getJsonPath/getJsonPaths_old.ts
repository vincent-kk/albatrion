import { isPlainObject } from '@winglet/common-utils/filter';
import { JSONPath } from '@winglet/json/path';

export const getJsonPaths = (data: any, jsonPath = '') => {
  const jsonPaths = [jsonPath];
  if (Array.isArray(data)) {
    jsonPaths.push(
      ...data
        .map((value, i) => getJsonPaths(value, `${jsonPath}[${i}]`))
        .flat(),
    );
  } else if (isPlainObject(data)) {
    jsonPaths.push(
      ...Object.entries(data)
        .map(([name, value]) =>
          getJsonPaths(value, `${jsonPath}${JSONPath.Child}${name}`),
        )
        .flat(),
    );
  }
  return jsonPaths.filter(Boolean);
};
