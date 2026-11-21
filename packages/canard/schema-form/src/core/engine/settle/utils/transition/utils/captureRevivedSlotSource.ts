import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntries } from '../../../../blueprint';
import type { BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type {
  DepartingWrite,
  RevivedSlotSource,
} from '../../../types/departingWrite';
import type { SettlementContext } from '../../../types/settlement';
import { isPlain } from '../../input/isPlain';
import { supersedeRevivedSlotSource } from './supersedeRevivedSlotSource';

/** Active bindings point to the final eligible own right. */
type RevivedSlotSources<Self> = Map<Self, RevivedSlotSource<Self>>;

/**
 * Bind the named input of a cancelled exit to the occurrences receiving it.
 * @param target - Actual occurrence selected for the whole revival write
 * @param write - Departing write in its original application order
 * @param context - Settlement that may later replace or detach the bindings
 * @returns Rights tree with one independently replaceable channel per named binding
 */
export const captureRevivedSlotSource = <Self extends FieldNodeRecord<Self>>(
  target: Self,
  write: DepartingWrite<Self>,
  context: SettlementContext<Self>,
): RevivedSlotSource<Self> => {
  const bindings: RevivedSlotSources<Self> = (context.revivedSlotSources ??=
    new Map());
  const seen = new WeakSet<object>();
  const capture = (
    binding: Self | undefined,
    template: BlueprintNode,
    suffix: string,
    value: unknown,
    parent?: RevivedSlotSource<Self>,
  ): RevivedSlotSource<Self> => {
    const source: RevivedSlotSource<Self> = {
      write,
      template,
      suffix,
      value,
      parent,
    };
    if (binding) {
      const earlier = bindings.get(binding);
      if (earlier) supersedeRevivedSlotSource(earlier);
      bindings.set(binding, source);
    }
    if (template.strategy !== 'branch') return source;
    if (isPlain(value) && template.kind === 'object' && !seen.has(value)) {
      seen.add(value);
      for (const name of Object.keys(value)) {
        const child = binding?.childrenByName?.[name];
        const entry =
          child?.blueprintNode ??
          template.childEntries.find(
            (entry) => entry.name === name && entry.node.kind !== 'virtual',
          )?.node;
        if (entry && entry.kind !== 'virtual' && value[name] !== undefined)
          (source.children ??= []).push(
            capture(
              child,
              entry,
              appendSegment(suffix, name),
              value[name],
              source,
            ),
          );
      }
      seen.delete(value);
    } else if (
      isArray(value) &&
      template.kind === 'array' &&
      !seen.has(value)
    ) {
      seen.add(value);
      for (let index = 0; index < value.length; index++) {
        const child = binding?.childrenByName?.['' + index];
        const entry =
          child?.blueprintNode ?? getItemEntries(template, index)[0]?.node;
        if (entry && value[index] !== undefined)
          (source.children ??= []).push(
            capture(
              child,
              entry,
              appendSegment(suffix, index),
              value[index],
              source,
            ),
          );
      }
      seen.delete(value);
    }
    return source;
  };
  return capture(target, write.template, write.suffix, write.value);
};
