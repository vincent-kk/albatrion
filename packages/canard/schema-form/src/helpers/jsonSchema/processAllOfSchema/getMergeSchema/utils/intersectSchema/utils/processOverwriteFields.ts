import type { JsonSchema } from '@/schema-form/types';

import { EXCLUDE_FIELDS } from './constants';

/**
 * 덮어쓰기 필드들을 처리합니다.
 * First-Win과 Special 필드를 제외한 모든 필드는 source 값으로 덮어씁니다.
 */
export function processOverwriteFields<T extends JsonSchema>(
  base: T,
  source: Partial<T>,
): Partial<T> {
  const entries = Object.entries(source);
  for (let i = 0, l = entries.length; i < l; i++) {
    const [key, value] = entries[i];
    if (EXCLUDE_FIELDS.has(key) || value === undefined) continue;
    base[key as keyof T] = value;
  }
  return base;
}
