import { isArray, isString } from '@lumy-pack/common';

type GetWatchValues = Fn<[dependencies: any[]], any[]>;

export const getWatchValuesFactory = (
  dependencyPaths: string[],
  watch: string | string[] | undefined,
): GetWatchValues | undefined => {
  if (!watch || !(isString(watch) || isArray(watch))) return;
  const watchValueIndexes = (isArray(watch) ? watch : [watch]).map((path) => {
    if (!dependencyPaths.includes(path)) dependencyPaths.push(path);
    return dependencyPaths.indexOf(path);
  });
  const functionBody = `return [${watchValueIndexes.join(',')}].map((index) => dependencies[index])`;
  return new Function('dependencies', functionBody) as GetWatchValues;
};
