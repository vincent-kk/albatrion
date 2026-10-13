import type { KeywordsByPath } from '@aileron/schema-form-scenarios';

import type { FormHandle } from '../../../../src';

/**
 * Read the issue keywords each listed node holds right now, without requesting validation.
 * @param handle - Mounted form handle.
 * @param expected - Paths to read; only its keys are used.
 * @returns Keywords per path in issue order; a missing node reads as no issues.
 */
export function readKeywords(handle: FormHandle, expected: KeywordsByPath): KeywordsByPath {
  return Object.fromEntries(Object.keys(expected).map((path) => [path, (handle.findNode(path)?.errors ?? []).map((issue) => issue.keyword ?? '')]));
}
