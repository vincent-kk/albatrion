import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { readGateProjectedExtra } from './readGateProjectedExtra';
import { readProjectedValue } from './readProjectedValue';

/** One immutable projection interval shared by gates at the same bound host. */
export interface GateHostView {
  /** Host publication identity before copying into the validator view. */
  readonly projected: unknown;
  /** Extras identity, including absence beneath blocking raw ancestors. */
  readonly extra: unknown;
  /** Complete current input; never reused after either source identity changes. */
  readonly value: Dictionary<unknown>;
}

/**
 * Share one full input view while immediate publication keeps both identities equal.
 * @param context - Current synchronous settlement; views never cross its lifetime
 * @param hostPath - Absolute occurrence-bound host pointer
 * @param owner - Current live evaluation owner, avoiding redundant host traversal
 * @returns Current projection, extras, and their shared merged validator view
 */
export const readGateHostView = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  hostPath: string,
  owner: Self,
): GateHostView => {
  const projected = readProjectedValue(context, hostPath);
  const extra = readGateProjectedExtra(context, hostPath, projected, owner);
  const views = (context.gateHostViews ??= new Map());
  const cached = views.get(hostPath);
  if (
    cached &&
    Object.is(cached.projected, projected) &&
    Object.is(cached.extra, extra)
  )
    return cached;
  const host =
    projected !== null && typeof projected === 'object' && !isArray(projected)
      ? projected
      : undefined;
  const extras =
    extra !== null && typeof extra === 'object' && !isArray(extra)
      ? extra
      : undefined;
  const value: Dictionary<unknown> = { ...host, ...extras };
  const view = { projected, extra, value };
  views.set(hostPath, view);
  return view;
};
