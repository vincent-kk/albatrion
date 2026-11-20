import { isArray } from '@winglet/common-utils/filter';

import {
  appendSegment,
  isDescendantPath,
} from '@/schema-form/helpers/jsonPointer';

import { getItemEntries } from '../../../../blueprint';
import type { BlueprintNode } from '../../../../blueprint';
import { isPlain } from '../../input/isPlain';

/** A named payload relative to the occurrence whose exit was cancelled. */
type NamedValue = {
  readonly suffix: string;
  readonly template: BlueprintNode;
  readonly value: unknown;
};

/**
 * Read the names a revived write still owns above the final exit policy. Live replacement
 * already cleared omitted keys, and a later live writer owns every address it replaced.
 * @param ownerPath - Address before compaction, where live replacements were tracked
 * @param named - Address, kind and payload of the revived departing record
 * @param laterPaths - Live replacements made after this record was applied
 * @returns Remaining payloads to place through the original exit occurrence's retained slot
 */
export function* getRevivedSlotValues(
  ownerPath: string,
  { suffix, template, value }: NamedValue,
  laterPaths: readonly string[],
): Iterable<NamedValue & { readonly isWhole: boolean }> {
  const path = ownerPath + suffix;
  if (
    value === undefined ||
    laterPaths.some((later) => path === later || isDescendantPath(path, later))
  )
    return;
  const isObject =
    template.strategy === 'branch' &&
    template.kind === 'object' &&
    isPlain(value);
  if (!laterPaths.some((later) => isDescendantPath(later, path))) {
    yield { suffix, template, value, isWhole: !isObject };
    return;
  }
  if (isObject) {
    const entries = template.childEntries;
    const extras = Object.fromEntries(
      Object.entries(value).filter(
        ([name]) => !entries.some((entry) => entry.name === name),
      ),
    );
    if (Object.keys(extras).length)
      yield { suffix, template, value: extras, isWhole: false };
    for (const [name, child] of Object.entries(value)) {
      const entry = entries.find((entry) => entry.name === name);
      if (entry)
        yield* getRevivedSlotValues(
          ownerPath,
          {
            suffix: appendSegment(suffix, name),
            template: entry.node,
            value: child,
          },
          laterPaths,
        );
    }
  } else if (
    template.strategy === 'branch' &&
    template.kind === 'array' &&
    isArray(value)
  ) {
    for (let index = 0; index < value.length; index++) {
      const entry = getItemEntries(template, index)[0];
      if (entry)
        yield* getRevivedSlotValues(
          ownerPath,
          {
            suffix: appendSegment(suffix, index),
            template: entry.node,
            value: value[index],
          },
          laterPaths,
        );
    }
  }
}
