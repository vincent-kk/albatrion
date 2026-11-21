import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import { BEHAVIORS, isOmittedEmpty } from '../../../behaviors';
import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { BATCH_HOST_SOURCE } from '../../../utils/batchHostSource';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { isPlain } from '../input/isPlain';
import { nextExtras } from '../input/nextExtras';
import { staticSpec } from '../input/staticSpec';
import { getSlotSource } from './getSlotSource';

/**
 * Interpret one inactive write into an immutable source-channel patch.
 * @param template - Exact target kind selected by the ordinary absent-path rule
 * @param input - Caller-owned input, never changed by distribution
 * @param instance - Retained source used only for partial merge inheritance
 * @param previous - Existing patch over that source
 * @param isWhole - Whether absent descendants lose their previous sources
 * @param isAutomatic - Whether this write is an automatic fill
 * @param seen - Invocation-local recursion guard shared by nested distribution
 * @returns Interpreted patch and whether a terminal descendant has a projected output value
 */
export const createSlotValueOverlay = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  input: unknown,
  instance: Optional<Self>,
  previous: Optional<InactiveSlotOverlay>,
  isWhole: boolean,
  isAutomatic = false,
  seen: WeakSet<object> = new WeakSet(),
): { overlay: InactiveSlotOverlay; hasWritten: boolean } => {
  if (template.kind === 'virtual') return { overlay: {}, hasWritten: false };
  if (template.strategy === 'terminal') {
    const behavior = BEHAVIORS[template.kind]?.[template.strategy];
    const source = behavior
      ? behavior.interpret(
          input,
          staticSpec(template.schemaType, template.isNullable),
        )
      : input;
    return {
      overlay: { isWhole: true, source },
      hasWritten: source !== undefined && !isOmittedEmpty(template, source),
    };
  }
  if (
    template.kind === 'array' &&
    template.hasCandidateDescendants &&
    isArray(input)
  ) {
    if (seen.has(input))
      return { overlay: { isWhole: true }, hasWritten: false };
    seen.add(input);
    const source = input.slice();
    const children = new Map<BlueprintChildEntry, InactiveSlotOverlay>();
    let hasWritten = false;
    for (let index = 0; index < input.length; index++) {
      const entry = getItemEntries(template, index)[0];
      if (!entry) continue;
      const child = createSlotValueOverlay(
        entry.node,
        input[index],
        undefined,
        undefined,
        isWhole,
        isAutomatic,
        seen,
      );
      children.set(entry, child.overlay);
      if (child.hasWritten) hasWritten = true;
      source[index] = undefined;
    }
    seen.delete(input);
    return {
      overlay: {
        isWhole: true,
        source: Object.freeze(source),
        itemCount: input.length,
        children,
      },
      hasWritten,
    };
  }
  if (!isPlain(input))
    return { overlay: { isWhole: true, source: input }, hasWritten: false };
  if (seen.has(input)) return { overlay: { isWhole: true }, hasWritten: false };
  seen.add(input);
  const previousSource =
    previous && hasOwnProperty(previous, 'source')
      ? previous.source
      : previous?.isWhole
        ? undefined
        : instance?.source;
  const previousExtras =
    previous && hasOwnProperty(previous, 'extras')
      ? previous.extras
      : previous?.isWhole
        ? undefined
        : instance?.extras;
  const extras = nextExtras(
    isWhole ? undefined : previousExtras,
    input,
    getDeclaredChildNames(template),
    !isWhole,
  );
  const children = new Map(isWhole ? undefined : previous?.children);
  let hasWritten = false;
  for (const name of Object.keys(input)) {
    const entry = template.childEntries.find((entry) => entry.name === name);
    if (!entry) continue;
    const prior = isWhole
      ? undefined
      : getSlotSource(instance, entry, previous);
    const child = createSlotValueOverlay(
      entry.node,
      Reflect.get(input, name),
      prior?.instance,
      prior?.overlay,
      isWhole,
      isAutomatic,
      seen,
    );
    children.set(entry, child.overlay);
    if (child.hasWritten) hasWritten = true;
    for (const sibling of template.childEntries) {
      if (sibling.name !== name || sibling.node === entry.node) continue;
      const prior = getSlotSource(instance, sibling, previous);
      if (prior.instance || prior.overlay)
        children.set(sibling, { isWhole: true, source: undefined });
    }
  }
  seen.delete(input);
  return {
    overlay: {
      ...(!isWhole ? previous : undefined),
      isWhole: isWhole || previous?.isWhole,
      source:
        BATCH_HOST_SOURCE in input
          ? Reflect.get(input, BATCH_HOST_SOURCE)
          : isWhole || (hasWritten && !isAutomatic)
            ? undefined
            : previousSource,
      extras,
      children,
    },
    hasWritten,
  };
};
