import type { ValidationIssue } from '@/schema-form/core';

/**
 * Build an issue check that reports `<key> required` for every listed key whose value is empty.
 * @param keys - Property names checked in order.
 * @returns A check from a form value to its issues in key order, each located at `/<key>`.
 */
export const requireKeys =
  (...keys: string[]) =>
  (value: any): ValidationIssue[] =>
    keys
      .filter((key) => !value?.[key])
      .map((key) => ({
        dataPath: '/' + key,
        keyword: 'required',
        message: key + ' required',
      }));
