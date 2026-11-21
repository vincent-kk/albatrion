import { isArray } from '@winglet/common-utils/filter';

import {
  BEHAVIORS,
  assembleArrayValue,
  assembleObjectValue,
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
import { visitInputChildren } from './visitInputChildren';

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
      source = Reflect.get(value, BATCH_HOST_SOURCE);
      const undeclared = nextExtras(
        undefined,
        value,
        getDeclaredChildNames(template),
        false,
      );
      if (isPlain(undeclared)) extras = undeclared;
      if (source === undefined)
        visitInputChildren(
          template,
          value,
          live,
          ancestors,
          (name, entry, child, raw) => {
            if (entry && (child || !live))
              active.set(
                String(name),
                readStoredInput(entry.node, raw, child, true, ancestors),
              );
          },
        );
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
    const slots: Record<string, unknown> = {};
    const items = isArray(value) && !ancestors.has(value) ? value : undefined;
    if (items) {
      source = undefined;
      visitInputChildren(
        template,
        items,
        live,
        ancestors,
        (index, entry, child, raw, isNamed) => {
          if (!entry || (live && !child && Number(index) < live.itemCount))
            return;
          const node = entry.node;
          slots[index] = {
            blueprintNode: node,
            storedOutputValue: readStoredInput(
              node,
              isNamed ? raw : undefined,
              child,
              true,
              ancestors,
            ),
          };
        },
      );
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
