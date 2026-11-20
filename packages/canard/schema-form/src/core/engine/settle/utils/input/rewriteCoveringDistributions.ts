import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { parsePointerSegments } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { hasDistributedChildInput } from './hasDistributedChildInput';
import { isPlain } from './isPlain';

/** Copy of `container` whose value at `names[index..]` is `value`; a missing or non-container step becomes an object. */
const replaceAt = (
  container: unknown,
  names: readonly string[],
  index: number,
  value: unknown,
): unknown => {
  if (index === names.length) return value;
  const copy = isArray(container)
    ? [...container]
    : isPlain(container)
      ? { ...container }
      : {};
  Reflect.set(
    copy,
    names[index],
    replaceAt(Reflect.get(copy, names[index]), names, index + 1, value),
  );
  return copy;
};

/**
 * Make every distribution of this settlement that covers an inactive address carry a later
 * declarative value for it. Compute replays a live host's distribution into its inactive children on
 * each pass, so without this an earlier caller value or a lower winner would replace the later
 * value in the slot again (WRITE-079).
 * @param context - Settlement whose live hosts may hold distributions
 * @param path - Absolute inactive address whose slot already holds `value`
 * @param value - Defined declarative value written at the address
 * @returns Nothing; each replaced distribution is logged for derive rollback
 */
export const rewriteCoveringDistributions = <
  Self extends FieldNodeRecord<Self>,
>(
  context: SettlementContext<Self>,
  path: string,
  value: unknown,
): void => {
  if (context.distributedInputs.size === 0) return;
  const names: string[] = [];
  for (const segment of parsePointerSegments(path)) {
    if (typeof segment !== 'string') return;
    names.push(segment);
  }
  let host = context.root;
  for (let index = 0; index < names.length; index++) {
    const distribution = context.distributedInputs.get(host);
    if (
      distribution &&
      hasDistributedChildInput(
        distribution.input,
        names[index],
        host.behavior.type === 'array',
      )
    ) {
      context.automaticLog.push({
        node: host,
        previousSource: host.source,
        previousExtras: host.extras,
        previousDistributed: distribution,
        isDistributionOnly: true,
      });
      context.distributedInputs.set(host, {
        ...distribution,
        input: replaceAt(distribution.input, names, index, value),
      });
    }
    const children = host.childrenByName;
    if (!children || !hasOwnProperty(children, names[index])) return;
    host = children[names[index]];
  }
};
