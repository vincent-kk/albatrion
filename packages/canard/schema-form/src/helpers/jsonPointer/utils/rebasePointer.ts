/** Replace a previously matched canonical prefix while preserving its encoded suffix. */
export const rebasePointer = (
  path: string,
  previousPath: string,
  nextPath: string,
): string => nextPath + path.slice(previousPath.length);
