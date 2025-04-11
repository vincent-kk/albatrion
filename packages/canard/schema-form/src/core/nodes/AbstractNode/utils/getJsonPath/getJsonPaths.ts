import { isPlainObject } from '@winglet/common-utils';
import { JSONPath } from '@winglet/json-schema';

export const getJsonPaths = (data: any, initialPath = ''): string[] => {
  const result: string[] = [];
  const stack: Array<{ data: any; path: string }> = [
    { data, path: initialPath },
  ];
  while (stack.length > 0) {
    const { data, path } = stack.pop()!;
    if (path) result.push(path);
    if (Array.isArray(data)) {
      for (let i = data.length - 1; i >= 0; i--)
        stack.push({
          data: data[i],
          path: `${path}[${i}]`,
        });
    } else if (isPlainObject(data)) {
      const entries = Object.entries(data);
      for (let i = entries.length - 1; i >= 0; i--) {
        const [key, value] = entries[i];
        stack.push({
          data: value,
          path: path
            ? `${path}${JSONPath.Child}${key}`
            : `${JSONPath.Child}${key}`,
        });
      }
    }
  }
  return result;
};
