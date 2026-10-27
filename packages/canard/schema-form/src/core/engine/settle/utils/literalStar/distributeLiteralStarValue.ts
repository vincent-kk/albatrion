import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import { BEHAVIORS, isOmittedEmpty } from '../../../behaviors';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { isPlain } from '../input/isPlain';
import { nextExtras } from '../input/nextExtras';
import { staticSpec } from '../input/staticSpec';
import { LiteralStarHostSource } from '../literalStarStore/LiteralStarHostSource';
import { pruneLiteralStarRaw } from '../literalStarStore/pruneLiteralStarRaw';
import { setLiteralStarRaw } from '../literalStarStore/setLiteralStarRaw';
import { clearOtherLiteralStarKinds } from './utils/clearOtherLiteralStarKinds';
import { distributeLiteralStarArrayValue } from './utils/distributeLiteralStarArrayValue';

/**
 * Distribute an absent-path write to one kind and clear other kinds (26C-14).
 * @param runtime - Tree whose latent map receives this source
 * @param context - Optional settlement for transition rollback
 * @param path - Absolute path of the absent occurrence
 * @param template - Kind chosen for this path
 * @param value - Caller or automatic input at this path
 * @param order - Occurrence position in blueprint document order
 * @param whole - Whether missing names below this path are replaced
 * @param siblings - Parent declarations whose other kinds lose this written path
 * @param automatic - Whether the distributed write belongs to a fill
 * @param seen - Caller-object recursion guard
 * @returns Whether a terminal descendant would have a projected emit
 */
export const distributeLiteralStarValue = <Self extends FieldNodeRecord<Self>>(
  runtime: FieldNodeRuntime<Self>,
  context: SettlementContext<Self> | undefined,
  path: string,
  template: BlueprintNode,
  value: unknown,
  order: readonly number[],
  whole: boolean,
  siblings: readonly BlueprintChildEntry[],
  automatic = false,
  seen: WeakSet<object> = new WeakSet(),
): boolean => {
  if (template.kind === 'virtual') return false;
  const key = JSON.stringify([path, getBlueprintNodeIdentity(template)]);
  const log = context?.inTransition
    ? context.literalStarAutomaticLog
    : undefined;
  const clearOtherKinds = (): void => {
    clearOtherLiteralStarKinds(runtime, context, path, template, siblings);
  };
  if (template.strategy === 'terminal') {
    const row = BEHAVIORS[template.kind]?.[template.strategy];
    const interpreted = row
      ? row.interpret(value, staticSpec(template.schemaType, template.nullable))
      : value;
    setLiteralStarRaw(
      runtime,
      log,
      key,
      interpreted !== undefined,
      interpreted,
      template,
      order,
      context,
    );
    clearOtherKinds();
    return interpreted !== undefined && !isOmittedEmpty(template, interpreted);
  }
  if (
    template.kind === 'array' &&
    template.hasCandidateDescendants &&
    isArray(value)
  ) {
    if (seen.has(value)) return false;
    seen.add(value);
    const wrote = distributeLiteralStarArrayValue(
      runtime,
      context,
      path,
      template,
      value,
      order,
      (childPath, childTemplate, childValue, childOrder, entries) =>
        distributeLiteralStarValue(
          runtime,
          context,
          childPath,
          childTemplate,
          childValue,
          childOrder,
          whole,
          entries,
          automatic,
          seen,
        ),
    );
    seen.delete(value);
    return wrote;
  }
  if (!isPlain(value)) {
    pruneLiteralStarRaw(runtime, path, undefined, context);
    setLiteralStarRaw(
      runtime,
      log,
      key,
      value !== undefined,
      value === undefined
        ? undefined
        : new LiteralStarHostSource(value, undefined),
      template,
      order,
      context,
    );
    clearOtherKinds();
    return false;
  }
  if (seen.has(value)) return false;
  seen.add(value);
  if (whole) pruneLiteralStarRaw(runtime, path, undefined, context);
  const prior = runtime.literalStarRaw?.get(key);
  const previous = prior instanceof LiteralStarHostSource ? prior : undefined;
  const declared = getDeclaredChildNames(template);
  const extras = nextExtras(
    whole ? undefined : previous?.undeclaredValues,
    value,
    declared,
    !whole,
  );
  let wrote = false;
  const names = Object.keys(value);
  for (const name of names) {
    const index = template.childEntries.findIndex(
      (entry) => entry.name === name,
    );
    if (index < 0) continue;
    const entry = template.childEntries[index];
    if (
      distributeLiteralStarValue(
        runtime,
        context,
        path + '/' + escapeSegment(name),
        entry.node,
        Reflect.get(value, name),
        [...order, index],
        whole,
        template.childEntries,
        automatic,
        seen,
      )
    )
      wrote = true;
  }
  const raw = whole || (wrote && !automatic) ? undefined : previous?.raw;
  const host =
    raw === undefined && extras === undefined
      ? undefined
      : previous &&
          Object.is(previous.raw, raw) &&
          Object.is(previous.undeclaredValues, extras)
        ? previous
        : new LiteralStarHostSource(raw, extras);
  setLiteralStarRaw(
    runtime,
    log,
    key,
    host !== undefined,
    host,
    template,
    order,
    context,
  );
  clearOtherKinds();
  seen.delete(value);
  return wrote;
};
