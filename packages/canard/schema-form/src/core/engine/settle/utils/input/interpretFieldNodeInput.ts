import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary, Optional } from '@aileron/declare';

import { BEHAVIORS } from '../../../behaviors';
import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { BATCH_HOST_SOURCE } from '../../../utils/batchHostSource';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { writeObjectKey } from '../../../utils/writeObjectKey';
import { isPlain } from './isPlain';
import { staticSpec } from './staticSpec';

/** First declared child bindings are shared by all occurrences of a template. */

/**
 * Interpret an input subtree without applying any settlement semantics.
 * @param template - Static occurrence restriction, including array item bindings
 * @param input - Marked source input; undeclared keys and tail slots remain intact
 * @param live - Current occurrence, whose selected descendants take priority over first candidates
 * @param readStoredValue - Use live child emissions for an updater while preserving the target's own value
 * @param seen - Ancestors already visited, preventing cyclic input recursion
 * @returns Interpreted source tree; unselected multi-candidate slots retain their input until selection, and unchanged containers retain their reference
 * @remarks O(visited input subtree); only changed containers are copied.
 */
export const interpretFieldNodeInput = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  input: unknown,
  live?: Self,
  readStoredValue = false,
  seen = new WeakSet<object>(),
): unknown => {
  if (input !== null && typeof input === 'object' && BATCH_HOST_SOURCE in input)
    return Reflect.get(input, BATCH_HOST_SOURCE);
  template = live?.blueprintNode ?? template;
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  const value = row
    ? row.interpret(input, staticSpec(template.schemaType, template.isNullable))
    : input;
  if (
    template.strategy !== 'branch' ||
    value === null ||
    typeof value !== 'object' ||
    seen.has(value)
  )
    return value;
  seen.add(value);
  try {
    if (template.kind === 'array' && isArray(value)) {
      let copy: Optional<unknown[]>;
      for (let index = 0; index < value.length; index++) {
        const item = live?.childrenByName?.['' + index];
        const candidates = getItemEntries(template, index);
        const child =
          item?.blueprintNode ??
          (candidates.length === 1 ? candidates[0].node : undefined);
        if (!child) continue;
        const next = interpretFieldNodeInput(
          child,
          value[index],
          item,
          readStoredValue,
          seen,
        );
        if (next !== value[index]) (copy ??= value.slice())[index] = next;
      }
      return copy ?? value;
    }
    if (template.kind === 'object' && isPlain(value)) {
      let children = getHostDerived<
        'objectChildren',
        ReadonlyMap<string, BlueprintNode>
      >(template).objectChildren;
      if (!children) {
        const bindings = new Map<string, BlueprintNode>();
        for (const entry of template.childEntries)
          if (!bindings.has(entry.name)) bindings.set(entry.name, entry.node);
        getHostDerived<'objectChildren', ReadonlyMap<string, BlueprintNode>>(
          template,
        ).objectChildren = children = bindings;
      }
      let copy: Optional<Dictionary<unknown>>;
      for (const name of Object.keys(value)) {
        const item = live?.childrenByName?.[name];
        const child = item?.blueprintNode ?? children.get(name);
        if (!child) continue;
        if (readStoredValue && live && !item) {
          delete (copy ??= { ...value })[name];
          continue;
        }
        const next = interpretFieldNodeInput(
          child,
          value[name],
          item,
          readStoredValue,
          seen,
        );
        if (readStoredValue && item) {
          const output = item.behavior.project(
            { schema: item.schema, source: next },
            next,
          );
          if (output === undefined) delete (copy ??= { ...value })[name];
          else if (output !== value[name])
            writeObjectKey((copy ??= { ...value }), name, output);
        } else if (next !== value[name])
          writeObjectKey((copy ??= { ...value }), name, next);
      }
      return copy ?? value;
    }
    return value;
  } finally {
    seen.delete(value);
  }
};
