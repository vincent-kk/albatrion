import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { getItemEntry } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import { isPlain } from '../write/isPlain';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';

/**
 * Test pre-fill raw absence only when a container's own default is a candidate.
 * @param template - Finite branch/scalar template owning this distributed source
 * @param value - Literal source before any descendant default is applied
 * @returns The same raw/extras absence used by generic isMissingRaw
 */
export const isMissingStaticInput = (template: BlueprintNode, value: unknown): boolean => {
  if (value === undefined) return true;
  if (template.strategy !== 'branch') return false;
  if (template.kind === 'array') {
    if (!isArray(value)) return false;
    for (let index = 0; index < value.length; index++) {
      const entry = getItemEntry(template, index);
      if (!entry || !isMissingStaticInput(entry.node, value[index])) return false;
    }
    return true;
  }
  if (!isPlain(value)) return false;
  const names = Object.keys(value);
  const declared = getDeclaredChildNames(template);
  for (let index = 0; index < names.length; index++)
    if (!declared.has(names[index])) return false;
  const entries = template.childEntries;
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (hasOwnProperty(value, entry.name) &&
      !isMissingStaticInput(entry.node, Reflect.get(value, entry.name))) return false;
  }
  return true;
};
