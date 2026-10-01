import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRecord } from '../../../record';
import { prunePerishedPath } from './prunePerishedPath';

/**
 * Discard paths of absent array slots, including items gated out before shrinking.
 * @param host - Array branch after its final itemCount is known
 * @returns Nothing; surviving slot paths remain untouched
 */
export const pruneArrayTailPaths = <Self extends SchemaNodeRecord<Self>>(
  host: Self,
): void => {
  const runtime = host.runtime;
  const removed = new Set<string>();
  const check = (path: string): void => {
    const prefix = `${host.path}/`;
    if (!path.startsWith(prefix)) return;
    const segment = path.slice(prefix.length).split('/')[0];
    const index = Number(segment);
    if (Number.isInteger(index) && index >= host.itemCount && index >= 0 &&
      String(index) === segment) removed.add(`${prefix}${segment}`);
  };
  for (const key of runtime.latentRaw.keys()) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string') check(identity[0]);
  }
  for (const metadata of runtime.latentRawMetadata?.values() ?? []) check(metadata.path);
  for (const key of runtime.committedDeclarationIds?.keys() ?? []) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string') check(identity[0]);
  }
  for (const path of runtime.typeMismatchPaths) check(path);
  for (const path of runtime.committedRuleKeysBySource?.keys() ?? []) check(path);
  for (const path of runtime.committedRuleKeysByTarget?.keys() ?? []) check(path);
  for (const path of removed) prunePerishedPath(runtime, path);
};
