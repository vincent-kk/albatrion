import { isArray } from '@winglet/common-utils/filter';

import { getStaticChoices, isOmittedEmpty } from '../../../../behaviors';
import { getItemEntries } from '../../../../blueprint';
import type { BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { interpretFieldNodeInput } from '../../../../settle';
import { BATCH_HOST_SOURCE } from '../../../../utils/batchHostSource';

/**
 * Decide whether a marked child can emit through a wrong-kind caller ancestor.
 * @param candidate - Child input without intermediate reactions
 * @param node - Current child binding supplying the effective output options
 * @param template - Binding used when a written array position has no live child
 * @param seen - Parents visited along this candidate path
 * @returns Whether static interpretation and omission permit output
 */
export const hasMarkedOutput = <Self extends FieldNodeRecord<Self>>(
  candidate: unknown,
  node: Self | undefined,
  template: BlueprintNode | undefined = node?.blueprintNode,
  seen = new WeakSet<object>(),
): boolean => {
  if (candidate === undefined || template?.kind === 'virtual') return false;
  if (candidate === null) return true;
  if (!template) return true;
  if (template.strategy === 'terminal') {
    const input = interpretFieldNodeInput(template, candidate, node);
    return node
      ? node.behavior.project(node, input) !== undefined
      : input !== undefined && !isOmittedEmpty(template, input);
  }
  if (typeof candidate !== 'object' || BATCH_HOST_SOURCE in candidate)
    return true;
  if (seen.has(candidate)) return false;
  const choices = node && getStaticChoices(node.schema);
  if (choices?.omitEmpty === false) return true;
  seen.add(candidate);
  try {
    if (template.kind === 'array' && isArray(candidate)) {
      if (candidate.length > 0 && !choices?.omitTrailingEmpty) return true;
      return candidate.some((item, index) => {
        const child = node?.childrenByName?.[index];
        return hasMarkedOutput(
          item,
          child,
          child?.blueprintNode ?? getItemEntries(template, index)[0]?.node,
          seen,
        );
      });
    }
    for (const name of Object.keys(candidate)) {
      const child = node?.childrenByName?.[name];
      const binding =
        child?.blueprintNode ??
        template.childEntries.find((entry) => entry.name === name)?.node;
      if (
        (!node || child || !binding) &&
        hasMarkedOutput(Reflect.get(candidate, name), child, binding, seen)
      )
        return true;
    }
    return false;
  } finally {
    seen.delete(candidate);
  }
};
