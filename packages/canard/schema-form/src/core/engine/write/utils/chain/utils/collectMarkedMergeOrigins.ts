import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { FieldNodeWriteKind } from '../../../../types/value';
import { isVirtualWriteFieldAdmitted } from '../../../../utils/paths/isVirtualWriteFieldAdmitted';
import { resolveStorageTargets } from '../../../../utils/paths/resolveStorageTargets';

/** One actual replacement or partial branch scope of a marked Merge. */
interface MergeOrigin {
  path: string;
  source: FieldNodeWriteKind;
  keys?: readonly string[];
}

/**
 * Record only supplied Merge descendants as replacements, retaining omitted sources.
 * @param node - Current occurrence, or its nearest live ancestor for an absent child.
 * @param value - Received partial value, without omitted committed keys.
 * @param source - Binding origin preserved on every expanded path.
 * @param path - Actual occurrence address for this recursive step.
 * @param template - Boundary determining branch-object merge semantics.
 * @param virtualFields - Constituent names admitted when a postponed virtual call entered
 * @returns Call-ordered partial branch markers and actual replacement leaves.
 */
export const collectMarkedMergeOrigins = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
  source: FieldNodeWriteKind,
  path = node.path,
  template: BlueprintNode = node.blueprintNode,
  virtualFields?: readonly string[],
): MergeOrigin[] => {
  if (template.kind === 'virtual') {
    const values = isArray(value) ? value : undefined;
    return (resolveStorageTargets(node) ?? []).flatMap((target, index) => {
      if (
        !isVirtualWriteFieldAdmitted(
          target.name,
          index,
          values,
          !!target.node,
          virtualFields,
        )
      )
        return [];
      const owner = target.node ?? node.parent;
      const childTemplate =
        target.node?.blueprintNode ??
        node.parent?.blueprintNode.childEntries.find(
          (entry) => entry.name === target.name,
        )?.node;
      return owner && childTemplate
        ? collectMarkedMergeOrigins(
            owner,
            values?.[index],
            source,
            target.path,
            childTemplate,
          )
        : [];
    });
  }
  if (
    template.kind !== 'object' ||
    template.strategy !== 'branch' ||
    value === null ||
    typeof value !== 'object' ||
    isArray(value)
  )
    return [{ path, source }];
  const origins: MergeOrigin[] = [{ path, source, keys: [] }];
  for (const name of Object.keys(value)) {
    const child = node.path === path ? node.childrenByName?.[name] : undefined;
    const childTemplate =
      child?.blueprintNode ??
      template.childEntries.find((entry) => entry.name === name)?.node;
    const childPath = appendSegment(path, name);
    if (childTemplate)
      origins.push(
        ...collectMarkedMergeOrigins(
          child ?? node,
          Reflect.get(value, name),
          source,
          childPath,
          childTemplate,
        ),
      );
    else origins.push({ path: childPath, source });
  }
  return origins;
};
