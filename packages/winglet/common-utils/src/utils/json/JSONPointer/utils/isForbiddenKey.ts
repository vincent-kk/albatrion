const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export const isForbiddenKey = (key: string): boolean => FORBIDDEN_KEYS.has(key);
