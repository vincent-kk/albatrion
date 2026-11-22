import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary, Optional } from '@aileron/declare';

import { BEHAVIORS } from '../../../behaviors';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { BATCH_HOST_SOURCE } from '../../../utils/batchHostSource';
import { writeObjectKey } from '../../../utils/writeObjectKey';
import { isPlain } from './isPlain';
import { staticSpec } from './staticSpec';
import { visitInputChildren } from './visitInputChildren';

/**
 * Interpret an input subtree without applying any settlement semantics.
 * @param template - Static occurrence restriction, including array item bindings
 * @param input - Marked source input; undeclared keys and tail slots remain intact
 * @param live - Current occurrence, whose selected descendants take priority over first candidates
 * @param seen - Ancestors already visited, preventing cyclic input recursion
 * @returns Interpreted source tree; unselected multi-candidate slots retain their input until selection, and unchanged containers retain their reference
 * @remarks O(visited input subtree); only changed containers are copied.
 */
export const interpretFieldNodeInput = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  input: unknown,
  live?: Self,
  seen = new WeakSet<object>(),
): unknown => {
  if (input !== null && typeof input === 'object' && BATCH_HOST_SOURCE in input)
    return Reflect.get(input, BATCH_HOST_SOURCE);
  template = live?.blueprintNode ?? template;
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  const value = row
    ? row.interpret(input, staticSpec(template.schemaType, template.isNullable))
    : input;
  if (template.strategy !== 'branch') return value;
  let objectCopy: Optional<Dictionary<unknown>>;
  let arrayCopy: Optional<unknown[]>;
  visitInputChildren(
    template,
    value,
    live,
    seen,
    (key, entry, child, raw, _, isAmbiguous) => {
      if (!child && isAmbiguous) return;
      const binding = child?.blueprintNode ?? entry?.node;
      if (!binding) return;
      const next = interpretFieldNodeInput(binding, raw, child, seen);
      if (next === raw) return;
      if (typeof key === 'number' && isArray(value))
        (arrayCopy ??= value.slice())[key] = next;
      else if (isPlain(value))
        writeObjectKey((objectCopy ??= { ...value }), String(key), next);
    },
  );
  return objectCopy ?? arrayCopy ?? value;
};
