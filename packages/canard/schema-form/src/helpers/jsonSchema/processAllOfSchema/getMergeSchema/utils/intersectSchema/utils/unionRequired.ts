import { unique } from '@winglet/common-utils/array';

/**
 * Required 배열을 합집합으로 처리합니다.
 */
export function unionRequired(
  baseRequired?: string[],
  sourceRequired?: string[],
): string[] | undefined {
  if (!baseRequired && !sourceRequired) return undefined;
  if (!baseRequired) return sourceRequired;
  if (!sourceRequired) return baseRequired;
  return unique([...baseRequired, ...sourceRequired]);
}
