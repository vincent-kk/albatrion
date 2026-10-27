import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import { BEHAVIORS } from '../../../behaviors';
import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { isPlain } from '../input/isPlain';
import { nextExtras } from '../input/nextExtras';
import { staticSpec } from '../input/staticSpec';
import { readLiteralStarMovedInput } from '../literalStar/readLiteralStarMovedInput';
import { LiteralStarHostSource } from '../literalStarStore/LiteralStarHostSource';
import { setLiteralStarRaw } from '../literalStarStore/setLiteralStarRaw';
import { resolveSlotSource } from './resolveSlotSource';
import { writeSlotPath } from './writeSlotPath';

/**
 * Distribute structural input to missing kinds without clearing retained siblings.
 * @param context - Candidate-bearing replay and its latent rollback bookkeeping
 * @param path - Absolute destination of an inactive declared occurrence
 * @param template - Kind that would interpret input if its gate were active
 * @param composed - Ordinary input carried by the surviving slot
 * @param order - Destination occurrence's blueprint document order
 * @param seen - Input ancestors used only during this replay's recursive descent
 * @returns Nothing; exact existing sources and their metadata remain untouched
 */
export const distributeMovedSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
  composed: unknown,
  order: readonly number[],
  seen: WeakSet<object> = new WeakSet(),
): void => {
  if (context.root.blueprintNode.containsLiteralStar !== true) {
    const retained = resolveSlotSource(context.root, path, template);
    if (retained.source || retained.overlay) return;
    writeSlotPath(
      context.root,
      path,
      template,
      composed,
      false,
      context,
      undefined,
      false,
      true,
    );
    return;
  }
  if (template.kind === 'virtual') return;
  const runtime = context.root.runtime;
  const key = JSON.stringify([path, getBlueprintNodeIdentity(template)]);
  const present = runtime.literalStarRaw?.has(key);
  const input = readLiteralStarMovedInput(context, path, template, composed);
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  const value = row
    ? row.interpret(input, staticSpec(template.schemaType, template.nullable))
    : input;
  const log = context.inTransition
    ? context.literalStarAutomaticLog
    : undefined;
  if (template.strategy === 'terminal') {
    if (!present && value !== undefined)
      setLiteralStarRaw(
        runtime,
        log,
        key,
        true,
        value,
        template,
        order,
        context,
      );
    return;
  }
  const array = template.kind === 'array' && isArray(value);
  if (array || isPlain(value)) {
    if (seen.has(value)) return;
    seen.add(value);
    const names = Object.keys(value);
    for (const name of names) {
      const entries = array
        ? getItemEntries(template, Number(name))
        : template.childEntries;
      const index = array
        ? 0
        : entries.findIndex((entry) => entry.name === name);
      const entry = entries[index];
      if (!entry) continue;
      distributeMovedSource(
        context,
        path + '/' + escapeSegment(name),
        entry.node,
        Reflect.get(value, name),
        [...order, array ? Number(name) : index],
        seen,
      );
    }
    seen.delete(value);
  }
  if (present) return;
  const extras = isPlain(value)
    ? nextExtras(undefined, value, getDeclaredChildNames(template), false)
    : undefined;
  const raw = isPlain(value) ? undefined : value;
  if (raw !== undefined || extras !== undefined)
    setLiteralStarRaw(
      runtime,
      log,
      key,
      true,
      new LiteralStarHostSource(raw, extras),
      template,
      order,
      context,
    );
};
