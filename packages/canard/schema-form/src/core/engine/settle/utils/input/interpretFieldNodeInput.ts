import { isArray } from '@winglet/common-utils/filter';

import { BEHAVIORS } from '../../../behaviors';
import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { isPlain } from './isPlain';
import { staticSpec } from './staticSpec';

/** First declared child bindings are shared by all occurrences of a template. */
const OBJECT_CHILDREN = new WeakMap<
  BlueprintNode,
  ReadonlyMap<string, BlueprintNode>
>();

/**
 * Interpret an input subtree without applying any settlement semantics.
 * @param template - Static occurrence restriction, including array item bindings
 * @param input - Marked raw input; undeclared keys and tail slots remain intact
 * @param live - Current occurrence, whose selected descendants take priority over first candidates
 * @param seen - Ancestors already visited, preventing cyclic input recursion
 * @returns Interpreted raw tree; unselected multi-candidate slots retain their input until selection, and unchanged containers retain their reference
 * @remarks O(visited input subtree); only changed containers are copied.
 */
export const interpretFieldNodeInput = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  input: unknown,
  live?: Self,
  seen = new WeakSet<object>(),
): unknown => {
  template = live?.blueprintNode ?? template;
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  const value = row
    ? row.interpret(input, staticSpec(template.schemaType, template.nullable))
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
      let copy: unknown[] | undefined;
      for (let index = 0; index < value.length; index++) {
        const item = live?.structure?.[String(index)];
        const candidates = getItemEntries(template, index);
        const child =
          item?.blueprintNode ??
          (candidates.length === 1 ? candidates[0].node : undefined);
        if (!child) continue;
        const next = interpretFieldNodeInput(child, value[index], item, seen);
        if (next !== value[index]) (copy ??= value.slice())[index] = next;
      }
      return copy ?? value;
    }
    if (template.kind === 'object' && isPlain(value)) {
      let children = OBJECT_CHILDREN.get(template);
      if (!children) {
        const bindings = new Map<string, BlueprintNode>();
        for (const entry of template.childEntries)
          if (!bindings.has(entry.name)) bindings.set(entry.name, entry.node);
        OBJECT_CHILDREN.set(template, (children = bindings));
      }
      let copy: Record<string, unknown> | undefined;
      for (const name of Object.keys(value)) {
        const item = live?.structure?.[name];
        const child = item?.blueprintNode ?? children.get(name);
        if (!child) continue;
        const next = interpretFieldNodeInput(child, value[name], item, seen);
        if (next !== value[name]) (copy ??= { ...value })[name] = next;
      }
      return copy ?? value;
    }
    return value;
  } finally {
    seen.delete(value);
  }
};
