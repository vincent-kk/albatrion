import { isArray } from '@winglet/common-utils/filter';

import { BEHAVIORS } from '../../../behaviors';
import { getItemEntry } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import { isPlain } from './isPlain';
import { staticSpec } from './staticSpec';

/** First declared child bindings are shared by all occurrences of a template. */
const OBJECT_CHILDREN = new WeakMap<BlueprintNode, ReadonlyMap<string, BlueprintNode>>();

/**
 * Interpret an input subtree without applying any settlement semantics.
 * @param template - Static occurrence restriction, including array item bindings
 * @param input - Marked raw input; undeclared keys and tail slots remain intact
 * @param seen - Ancestors already visited, preventing cyclic input recursion
 * @returns Interpreted raw tree with unchanged containers retained by reference
 * @remarks O(visited input subtree); only changed containers are copied.
 */
export const interpretSchemaNodeInput = (
  template: BlueprintNode, input: unknown, seen = new WeakSet<object>(),
): unknown => {
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  const value = row ? row.interpret(input,
    staticSpec(template.schemaType, template.nullable)) : input;
  if (template.strategy !== 'branch' || value === null ||
    typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  try {
    if (template.kind === 'array' && isArray(value)) {
      let copy: unknown[] | undefined;
      for (let index = 0; index < value.length; index++) {
        const child = getItemEntry(template, index);
        if (!child) continue;
        const next = interpretSchemaNodeInput(child.node, value[index], seen);
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
        OBJECT_CHILDREN.set(template, children = bindings);
      }
      let copy: Record<string, unknown> | undefined;
      for (const name of Object.keys(value)) {
        const child = children.get(name);
        if (!child) continue;
        const next = interpretSchemaNodeInput(child, value[name], seen);
        if (next !== value[name]) (copy ??= { ...value })[name] = next;
      }
      return copy ?? value;
    }
    return value;
  } finally { seen.delete(value); }
};
