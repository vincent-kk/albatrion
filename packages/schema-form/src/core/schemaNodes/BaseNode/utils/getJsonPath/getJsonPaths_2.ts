import { isPlainObject } from 'es-toolkit';

export const getJsonPaths = (data: any, jsonPath = ''): string[] => {
  if (data === undefined || data === null || data === false) return [];

  const paths = jsonPath ? [jsonPath] : [];

  if (Array.isArray(data)) {
    return data.length === 0
      ? paths
      : paths.concat(
          data.flatMap((value, i) => getJsonPaths(value, `${jsonPath}[${i}]`)),
        );
  }

  if (isPlainObject(data)) {
    const entries = Object.entries(data);
    return entries.length === 0
      ? paths
      : paths.concat(
          entries.flatMap(([key, value]) =>
            getJsonPaths(value, jsonPath ? `${jsonPath}.${key}` : `.${key}`),
          ),
        );
  }

  return paths;
};
