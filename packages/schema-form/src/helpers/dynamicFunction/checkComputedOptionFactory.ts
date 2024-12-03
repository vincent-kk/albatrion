import { JSONPath } from '@lumy/schema-form/types';

const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);

type CheckComputedOption = Fn<[dependencies: any[]], boolean>;

export const checkComputedOptionFactory = (
  dependencyPaths: string[],
  expression: string | boolean | undefined,
): CheckComputedOption | undefined => {
  if (typeof expression !== 'string') return;
  const functionBody = `return !!(${expression
    .replace(JSON_PATH_REGEX, (path) => {
      if (!dependencyPaths.includes(path)) {
        dependencyPaths.push(path);
      }
      return `dependencies[${dependencyPaths.indexOf(path)}]`;
    })
    .trim()
    .replace(/;$/, '')})`;
  return new Function('dependencies', functionBody) as CheckComputedOption;
};
