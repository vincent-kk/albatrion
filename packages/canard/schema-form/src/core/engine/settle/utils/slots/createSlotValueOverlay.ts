import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import { BEHAVIORS, isOmittedEmpty } from '../../../behaviors';
import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
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
 * @param whole - Whether absent descendants lose their previous sources
 * @param automatic - Whether this write is an automatic fill
 * @param seen - Invocation-local recursion guard shared by nested distribution
 * @returns Interpreted patch and whether a terminal descendant has a projected emit
 */
export const createSlotValueOverlay = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  input: unknown,
  instance: Optional<Self>,
  previous: Optional<InactiveSlotOverlay>,
  whole: boolean,
  automatic = false,
  seen: WeakSet<object> = new WeakSet(),
): { overlay: InactiveSlotOverlay; wrote: boolean } => {
  if (template.kind === 'virtual') return { overlay: {}, wrote: false };
  if (template.strategy === 'terminal') {
    const behavior = BEHAVIORS[template.kind]?.[template.strategy];
    const source = behavior
      ? behavior.interpret(
          input,
          staticSpec(template.schemaType, template.nullable),
        )
      : input;
    return {
      overlay: { replace: true, source },
      wrote: source !== undefined && !isOmittedEmpty(template, source),
    };
  }
  if (
    template.kind === 'array' &&
    template.hasCandidateDescendants &&
    isArray(input)
  ) {
    if (seen.has(input)) return { overlay: { replace: true }, wrote: false };
    seen.add(input);
    const source = input.slice();
    const children = new Map<BlueprintChildEntry, InactiveSlotOverlay>();
    let wrote = false;
    for (let index = 0; index < input.length; index++) {
      const entry = getItemEntries(template, index)[0];
      if (!entry) continue;
      const child = createSlotValueOverlay(
        entry.node,
        input[index],
        undefined,
        undefined,
        whole,
        automatic,
        seen,
      );
      children.set(entry, child.overlay);
      if (child.wrote) wrote = true;
      source[index] = undefined;
    }
    seen.delete(input);
    return {
      overlay: {
        replace: true,
        source: Object.freeze(source),
        itemCount: input.length,
        children,
      },
      wrote,
    };
  }
  if (!isPlain(input))
    return { overlay: { replace: true, source: input }, wrote: false };
  if (seen.has(input)) return { overlay: { replace: true }, wrote: false };
  seen.add(input);
  const previousSource =
    previous && hasOwnProperty(previous, 'source')
      ? previous.source
      : previous?.replace
        ? undefined
        : instance?.source;
  const previousExtras =
    previous && hasOwnProperty(previous, 'extras')
      ? previous.extras
      : previous?.replace
        ? undefined
        : instance?.extras;
  const extras = nextExtras(
    whole ? undefined : previousExtras,
    input,
    getDeclaredChildNames(template),
    !whole,
  );
  const children = new Map(whole ? undefined : previous?.children);
  let wrote = false;
  for (const name of Object.keys(input)) {
    const entry = template.childEntries.find((entry) => entry.name === name);
    if (!entry) continue;
    const prior = whole ? undefined : getSlotSource(instance, entry, previous);
    const child = createSlotValueOverlay(
      entry.node,
      Reflect.get(input, name),
      prior?.instance,
      prior?.overlay,
      whole,
      automatic,
      seen,
    );
    children.set(entry, child.overlay);
    if (child.wrote) wrote = true;
    for (const sibling of template.childEntries) {
      if (sibling.name !== name || sibling.node === entry.node) continue;
      const prior = getSlotSource(instance, sibling, previous);
      if (prior.instance || prior.overlay)
        children.set(sibling, { replace: true, source: undefined });
    }
  }
  seen.delete(input);
  return {
    overlay: {
      ...(!whole ? previous : undefined),
      replace: whole || previous?.replace,
      source: whole || (wrote && !automatic) ? undefined : previousSource,
      extras,
      children,
    },
    wrote,
  };
};
