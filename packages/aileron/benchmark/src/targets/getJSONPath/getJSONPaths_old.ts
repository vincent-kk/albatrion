import { isPlainObject } from '@winglet/common-utils/filter';
import { JSONPath } from '@winglet/json/path';

export const getJSONPaths = (data: any, jsonPath = '') => {
  const jsonPaths = [jsonPath];
  if (Array.isArray(data)) {
    jsonPaths.push(
      ...data
        .map((value, i) => getJSONPaths(value, `${jsonPath}[${i}]`))
        .flat(),
    );
  } else if (isPlainObject(data)) {
    jsonPaths.push(
      ...Object.entries(data)
        .map(([name, value]) =>
          getJSONPaths(value, `${jsonPath}${JSONPath.Child}${name}`),
        )
        .flat(),
    );
  }
  return jsonPaths.filter(Boolean);
};
