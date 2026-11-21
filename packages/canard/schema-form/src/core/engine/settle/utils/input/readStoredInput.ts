import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  BEHAVIORS,
  assembleArrayValue,
  assembleObjectValue,
  getArrayItemTemplate,
  getStaticChoices,
} from '../../../behaviors';
import { mergeEffectiveSchema } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { BATCH_HOST_SOURCE } from '../../../utils/batchHostSource';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { arrayExtras } from './arrayExtras';
import { isPlain } from './isPlain';
import { nextExtras } from './nextExtras';
import { staticSpec } from './staticSpec';

/**
 * Evaluate a marked storage input with the currently selected child bindings.
 * @param template - Binding that provides the static input type
 * @param input - Composed caller source, including any hidden wrong-kind host source
 * @param live - Current occurrence, if it exists
 * @param output - Whether the caller needs this child emission or the target's own value
 * @param ancestors - Source objects on the current recursion path
 * @returns Assembled stored value or its emission, without committing either one
 */
export const readStoredInput = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  input: unknown,
  live?: Self,
  output = false,
  ancestors = new WeakSet<object>(),
): unknown => {
  template = live?.blueprintNode ?? template;
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  if (!row) return input;
  const value = row.interpret(
    input,
    staticSpec(template.schemaType, template.isNullable),
  );
  const schema =
    live?.schema ?? mergeEffectiveSchema(template, [], { mode: 'runtime' });
  let source = value;
  let stored = value;

  if (
    template.strategy === 'branch' &&
    template.kind === 'object' &&
    value !== null
  ) {
    const entries = template.childEntries;
    const active = new Map<string, unknown>();
    let extras: object | undefined;
    if (isPlain(value) && !ancestors.has(value)) {
      ancestors.add(value);
      try {
        source = Reflect.get(value, BATCH_HOST_SOURCE);
        const undeclared = nextExtras(
          undefined,
          value,
          getDeclaredChildNames(template),
          false,
        );
        if (isPlain(undeclared)) extras = undeclared;
        if (source === undefined) {
          for (const entry of entries) {
            const name = entry.name;
            if (active.has(name)) continue;
            const children = live?.childrenByName;
            const child =
              children && hasOwnProperty(children, name)
                ? children[name]
                : undefined;
            if (!child && live) continue;
            active.set(
              name,
              hasOwnProperty(value, name)
                ? readStoredInput(
                    entry.node,
                    value[name],
                    child,
                    true,
                    ancestors,
                  )
                : undefined,
            );
          }
        }
      } finally {
        ancestors.delete(value);
      }
    }
    stored =
      source === null
        ? null
        : assembleObjectValue(
            live?.storedValue,
            entries,
            getStaticChoices(schema).propertyOrder,
            getHostDerived<
              'childOrderIndex',
              ReadonlyMap<string, ReadonlyMap<object, number>>
            >(template).childOrderIndex,
            active,
            extras,
            [],
          );
  } else if (template.strategy === 'branch' && template.kind === 'array') {
    const selection = {
      blueprintNode: template,
      childrenByName: live?.childrenByName ?? null,
    };
    const slots: Record<string, unknown> = {};
    const items = isArray(value) && !ancestors.has(value) ? value : undefined;
    if (items) {
      source = undefined;
      ancestors.add(items);
      try {
        for (let index = 0; index < items.length; index++) {
          const binding = getArrayItemTemplate(selection, index);
          if (!binding) continue;
          const child = live?.childrenByName?.['' + index];
          if (!child && live && index < live.itemCount) continue;
          slots[index] = {
            blueprintNode: binding,
            storedOutputValue: readStoredInput(
              binding,
              hasOwnProperty(items, index) ? items[index] : undefined,
              child,
              true,
              ancestors,
            ),
          };
        }
      } finally {
        ancestors.delete(items);
      }
    }
    const previous = live?.storedValue;
    stored = assembleArrayValue(
      {
        blueprintNode: template,
        childrenByName: slots,
        itemCount: items?.length ?? 0,
        extras:
          items &&
          arrayExtras({ blueprintNode: template, extras: live?.extras }, items),
        source,
      },
      isArray(previous) ? previous : undefined,
    );
  }
  return output ? row.project({ schema, source }, stored) : stored;
};
