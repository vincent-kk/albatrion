import type { JsonSchema } from '@/schema-form/types';

import { EXCLUDE_FIELDS } from './constants';

/**
 * 덮어쓰기 필드들을 처리합니다.
 * First-Win과 Special 필드를 제외한 모든 필드는 source 값으로 덮어씁니다.
 */
export function processOverwriteFields<T extends JsonSchema>(
  base: T,
  source: Partial<T>,
) {
  const keys = Object.keys(source);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const value = source[k];
    if (EXCLUDE_FIELDS.has(k) || value === undefined) continue;
    base[k as keyof T] = value;
  }
}
