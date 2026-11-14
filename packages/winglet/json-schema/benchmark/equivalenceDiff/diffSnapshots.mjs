import { isDeepStrictEqual } from 'node:util';

/**
 * Compare named snapshot values, preserving array order and ignoring object key order.
 * @param {object} baseline Frozen nonempty named-case snapshot.
 * @param {object} current Current nonempty named-case snapshot.
 * @param {{allow?: string[], requireChanged?: string[]}} options Explicit difference permissions and obligations.
 * @returns {string[]} Names of changed cases.
 * @throws For malformed snapshots, differing case sets, unknown names or unmet constraints.
 */
export function diffSnapshots(
  baseline,
  current,
  { allow = [], requireChanged = [] } = {},
) {
  for (const [label, snapshot] of [
    ['baseline', baseline],
    ['current', current],
  ]) {
    if (
      !snapshot ||
      typeof snapshot !== 'object' ||
      Array.isArray(snapshot) ||
      !Object.keys(snapshot).length
    )
      throw new Error(
        `Invalid ${label} snapshot: expected a nonempty case object`,
      );
  }
  const names = Object.keys(current);
  const missing = names.filter((name) => !Object.hasOwn(baseline, name));
  const extra = Object.keys(baseline).filter(
    (name) => !Object.hasOwn(current, name),
  );
  if (missing.length || extra.length)
    throw new Error(
      `Case set mismatch: missing baseline [${missing}], missing current [${extra}]`,
    );
  const unknown = [...allow, ...requireChanged].filter(
    (name) => !Object.hasOwn(current, name),
  );
  if (unknown.length) throw new Error(`Unknown cases: ${unknown}`);
  const changed = names.filter(
    (name) => !isDeepStrictEqual(baseline[name], current[name]),
  );
  const unexpected = changed.filter((name) => !allow.includes(name));
  const unchanged = requireChanged.filter((name) => !changed.includes(name));
  if (unexpected.length || unchanged.length)
    throw new Error(
      `Unexpected changes: [${unexpected}]; required but unchanged: [${unchanged}]`,
    );
  return changed;
}
