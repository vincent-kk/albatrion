import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntries } from '../../../../../blueprint';
import type { BlueprintNode } from '../../../../../blueprint';
import type { FieldNodeRecord } from '../../../../../record';
import type {
  DepartingWrite,
  RevivedSlotSource,
} from '../../../../types/departingWrite';
import type { SettlementContext } from '../../../../types/settlement';
import { isPlain } from '../../../input/isPlain';
import { getSourceBoundary } from '../../../source/getSourceBoundary';
import { recordRevivedChildSource } from '../recordRevivedChildSource';
import { supersedeRevivedSlotSource } from '../supersedeRevivedSlotSource';

/**
 * Capture a revived binding and its named descendants using the write's shared cycle guard.
 */
export const captureRevivedBindingSource = <Self extends FieldNodeRecord<Self>>(
  binding: Self | undefined,
  template: BlueprintNode,
  suffix: string,
  value: unknown,
  parent: RevivedSlotSource<Self> | undefined,
  write: DepartingWrite<Self>,
  context: SettlementContext<Self>,
  seen: WeakSet<object>,
): RevivedSlotSource<Self> => {
  const source: RevivedSlotSource<Self> = {
    write,
    template,
    suffix,
    value,
    parent,
  };
  if (binding) {
    const retained = getSourceBoundary(binding, context);
    const earlier = retained.revivedSlotSource;
    if (earlier) supersedeRevivedSlotSource(earlier);
    retained.revivedSlotSource = source;
  }
  if (template.strategy !== 'branch') return source;
  if (isPlain(value) && template.kind === 'object' && !seen.has(value)) {
    seen.add(value);
    for (const name of Object.keys(value)) {
      const child = binding?.childrenByName?.[name];
      const entry = child
        ? undefined
        : template.childEntries.find(
            (entry) => entry.name === name && entry.node.kind !== 'virtual',
          );
      const candidate = child?.blueprintNode ?? entry?.node;
      if (
        !candidate ||
        candidate.kind === 'virtual' ||
        value[name] === undefined
      )
        continue;
      const named = captureRevivedBindingSource(
        child,
        candidate,
        appendSegment(suffix, name),
        value[name],
        source,
        write,
        context,
        seen,
      );
      (source.children ??= []).push(named);
      if (binding && entry)
        recordRevivedChildSource(binding, entry, named, context);
    }
    seen.delete(value);
  } else if (isArray(value) && template.kind === 'array' && !seen.has(value)) {
    seen.add(value);
    for (let index = 0; index < value.length; index++) {
      const child = binding?.childrenByName?.['' + index];
      const entry = child ? undefined : getItemEntries(template, index)[0];
      const candidate = child?.blueprintNode ?? entry?.node;
      if (!candidate || value[index] === undefined) continue;
      const named = captureRevivedBindingSource(
        child,
        candidate,
        appendSegment(suffix, index),
        value[index],
        source,
        write,
        context,
        seen,
      );
      (source.children ??= []).push(named);
      if (binding && entry)
        recordRevivedChildSource(binding, entry, named, context);
    }
    seen.delete(value);
  }
  return source;
};
