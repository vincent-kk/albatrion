import type { JsonSchema } from '@/schema-form/types';

import { FIRST_WIN_FIELDS } from './constants';

/**
 * First-Win 필드들을 처리합니다.
 * base에 값이 있으면 base 값 유지, 없으면 source 값 사용
 */
export function processFirstWinFields<T extends JsonSchema>(
  base: T,
  source: Partial<T>,
) {
  for (let i = 0, l = FIRST_WIN_FIELDS.length; i < l; i++) {
    const field = FIRST_WIN_FIELDS[i];
    const baseValue = base[field as keyof T];
    const sourceValue = source[field as keyof T];
    if (baseValue !== undefined) base[field as keyof T] = baseValue;
    else if (sourceValue !== undefined) base[field as keyof T] = sourceValue;
  }
}
