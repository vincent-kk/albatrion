import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import { BEHAVIORS, isOmittedEmpty } from '../../../behaviors';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { BATCH_HOST_SOURCE } from '../../../utils/batchHostSource';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { canReleaseCallerHost } from '../input/canReleaseCallerHost';
import { decideAddressWrite } from '../input/decideAddressWrite';
import { isPlain } from '../input/isPlain';
import { nextExtras } from '../input/nextExtras';
import { staticSpec } from '../input/staticSpec';
import { visitInputChildren } from '../input/visitInputChildren';
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
  const array =
    template.kind === 'array' &&
    template.hasCandidateDescendants &&
    isArray(input)
      ? input
      : undefined;
  const object = isPlain(input) ? input : undefined;
  if (!array && !object)
    return { overlay: { isWhole: true, source: input }, hasWritten: false };
  const keepsChildren = !array && decideAddressWrite(template, input, !isWhole);
  const source = array?.slice();
  const children = new Map<BlueprintChildEntry, InactiveSlotOverlay>(
    keepsChildren ? previous?.children : undefined,
  );
  let hasWritten = false;
  const visited = visitInputChildren(
    template,
    input,
    undefined,
    seen,
    (name, entry, _, value) => {
      if (!entry) return;
      const prior = keepsChildren
        ? getSlotSource(instance, entry, previous)
        : undefined;
      const child = createSlotValueOverlay(
        entry.node,
        value,
        prior?.instance,
        prior?.overlay,
        array ? isWhole : !keepsChildren,
        isAutomatic,
        seen,
      );
      children.set(entry, child.overlay);
      if (child.hasWritten) hasWritten = true;
      if (source) source[Number(name)] = undefined;
      else
        for (const sibling of template.childEntries) {
          if (sibling.name !== name || sibling.node === entry.node) continue;
          const prior = getSlotSource(instance, sibling, previous);
          if (prior.instance || prior.overlay)
            children.set(sibling, { isWhole: true, source: undefined });
        }
    },
  );
  if (array)
    return {
      overlay: visited
        ? {
            isWhole: true,
            source: Object.freeze(source),
            itemCount: array.length,
            children,
          }
        : { isWhole: true },
      hasWritten,
    };
  if (!object || (!visited && template.kind === 'object'))
    return { overlay: { isWhole: true }, hasWritten: false };
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
  return {
    overlay: {
      ...(keepsChildren ? previous : undefined),
      isWhole: !keepsChildren || previous?.isWhole,
      source:
        BATCH_HOST_SOURCE in object
          ? Reflect.get(object, BATCH_HOST_SOURCE)
          : !keepsChildren ||
              (!isAutomatic && canReleaseCallerHost(previousSource, hasWritten))
            ? undefined
            : previousSource,
      extras: nextExtras(
        keepsChildren ? previousExtras : undefined,
        object,
        getDeclaredChildNames(template),
        keepsChildren,
      ),
      children,
    },
    hasWritten,
  };
};
