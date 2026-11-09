import { isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { merge } from '@winglet/common-utils/object';

import { DECLARATION_OPTION_KEYS } from '@/schema-form/constants/reservedSchemaKeys';

import { ownedSchemaValues } from '../../../../utils/cache/valueMemos';
import { freezeCreatedHintObjects } from '../finalize/freezeCreatedHintObjects';

/**
 * Merge a renderer hint group through shared immutable copy-on-write policies.
 * @param earlier - Earlier group or undefined.
 * @param later - Later group whose undefined children must not erase values.
 * @param omitVirtual - Whether options.virtual declarations must be excluded.
 * @param isAtomic - Optional renderer-supplied opaque-value predicate.
 * @returns A shared singleton/replacement or a newly merged group; inputs stay intact.
 */
export const mergeHintGroup = (
  earlier: unknown,
  later: unknown,
  omitVirtual: boolean,
  isAtomic?: (value: unknown) => boolean,
): unknown => {
  let source = later;
  if (omitVirtual && isPlainObject(later))
    for (let index = 0; index < DECLARATION_OPTION_KEYS.length; index++)
      if (hasOwnProperty(later, DECLARATION_OPTION_KEYS[index])) {
        const entries = Object.entries(later);
        let retained = 0;
        for (let entry = 0; entry < entries.length; entry++) {
          let declarationOnly = false;
          for (let key = 0; key < DECLARATION_OPTION_KEYS.length; key++)
            if (entries[entry][0] === DECLARATION_OPTION_KEYS[key]) {
              declarationOnly = true;
              break;
            }
          if (!declarationOnly) entries[retained++] = entries[entry];
        }
        entries.length = retained;
        source = Object.fromEntries(entries);
        break;
      }
  if (source !== later && source && typeof source === 'object')
    ownedSchemaValues.add(source);
  if (source === undefined) return earlier;
  if (earlier === undefined) return source;
  if (
    !earlier ||
    !source ||
    typeof earlier !== 'object' ||
    typeof source !== 'object'
  )
    return source;
  const result = merge(earlier, source, {
    immutable: true,
    preserveReferences: true,
    arrayStrategy: 'replace',
    isAtomic,
  });
  if (result !== earlier && result !== source) {
    freezeCreatedHintObjects(result, earlier, source);
    ownedSchemaValues.add(result);
  }
  return result;
};
