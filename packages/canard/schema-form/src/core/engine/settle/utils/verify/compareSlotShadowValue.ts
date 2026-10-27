import type { FieldNodeRecord } from '../../../record';
import type { SlotShadowSession } from '../../types/slotVerification';
import { compareSlotShadowIntrinsic } from './compareSlotShadowIntrinsic';
import { rejectSlotShadowDifference } from './rejectSlotShadowDifference';

/**
 * Compare public data and its cross-commit object-reference relationships.
 * @param session - Persistent bijections for node and public object identities
 * @param actual - Observation from the retained-instance tree
 * @param shadow - Observation from the independently settled latent tree
 * @param path - Readable channel address included in a rejected difference
 * @param visited - Per-comparison cycle guard, separate from historical identity
 * @param identity - Whether this channel promises observable reference stability
 * @returns Nothing when values and the requested reference relations agree
 */
export const compareSlotShadowValue = <Self extends FieldNodeRecord<Self>>(
  session: SlotShadowSession<Self>,
  actual: unknown,
  shadow: unknown,
  path: string,
  visited = new WeakMap<object, object>(),
  identity = true,
): void => {
  if (
    actual === null ||
    shadow === null ||
    typeof actual !== 'object' ||
    typeof shadow !== 'object'
  ) {
    if (!Object.is(actual, shadow)) rejectSlotShadowDifference(session, path);
    return;
  }
  const actualNodes: ReadonlyMap<object, Self> = session.nodes;
  const shadowNodes: ReadonlyMap<object, Self> = session.reverseNodes;
  const actualNode = actualNodes.get(actual);
  const shadowNode = shadowNodes.get(shadow);
  if (actualNode || shadowNode) {
    if (actualNode !== shadow || shadowNode !== actual)
      rejectSlotShadowDifference(session, path + '.nodeReference');
    return;
  }
  if (identity) {
    if (
      (session.references.has(actual) &&
        session.references.get(actual) !== shadow) ||
      (session.reverseReferences.has(shadow) &&
        session.reverseReferences.get(shadow) !== actual)
    )
      rejectSlotShadowDifference(
        session,
        path +
          '.reference' +
          (session.references.has(actual) &&
          session.references.get(actual) !== shadow
            ? '.actualStable'
            : '.baselineStable'),
      );
    session.references.set(actual, shadow);
    session.reverseReferences.set(shadow, actual);
  }
  if (visited.get(actual) === shadow) return;
  visited.set(actual, shadow);
  if (Object.getPrototypeOf(actual) !== Object.getPrototypeOf(shadow))
    rejectSlotShadowDifference(session, path + '.prototype');
  if (
    !compareSlotShadowIntrinsic(actual, shadow, (left, right, key) =>
      compareSlotShadowValue(
        session,
        left,
        right,
        path + '.' + key,
        visited,
        identity,
      ),
    )
  )
    rejectSlotShadowDifference(session, path + '.intrinsic');
  const actualKeys = Object.keys(actual);
  const shadowKeys = Object.keys(shadow);
  if (
    actualKeys.length !== shadowKeys.length ||
    actualKeys.some((key, index) => key !== shadowKeys[index])
  )
    rejectSlotShadowDifference(session, path + '.keys');
  if (actual instanceof Error && shadow instanceof Error) {
    if (actual.name !== shadow.name || actual.message !== shadow.message)
      rejectSlotShadowDifference(session, path + '.error');
  }
  for (const key of actualKeys)
    compareSlotShadowValue(
      session,
      Reflect.get(actual, key),
      Reflect.get(shadow, key),
      path + '.' + key,
      visited,
      identity,
    );
};
