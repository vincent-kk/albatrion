// npm package naming rules: lowercase alphanumerics plus `.`, `-`, `_`,
// and cannot start with `.` or `_`. The same shape applies to the scope
// segment of a scoped package (`@<scope>/<name>`).
const NPM_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

export type ClassifiedTarget =
  | { kind: 'scope'; scope: string }
  | { kind: 'package'; name: string }
  | { kind: 'invalid'; reason: string };

/**
 * Classify a `--package` value as a scope alias, a package name, or invalid.
 *
 * - `@<scope>` (no slash) — all packages under that npm scope
 * - `@<scope>/<name>` — one scoped package
 * - `<name>` (no `@`, no slash) — one unscoped package
 * - anything else → invalid
 */
export function classifyTarget(target: string): ClassifiedTarget {
  if (typeof target !== 'string' || target.length === 0) {
    return { kind: 'invalid', reason: 'empty --package value' };
  }

  if (target.startsWith('@')) {
    const body = target.slice(1);
    const slashIndex = body.indexOf('/');

    if (slashIndex === -1) {
      if (!NPM_NAME_PATTERN.test(body)) {
        return {
          kind: 'invalid',
          reason: `invalid scope alias "${target}" — expected "@<scope>" with lowercase alphanumerics, ".", "-", or "_"`,
        };
      }
      return { kind: 'scope', scope: body };
    }

    const scopePart = body.slice(0, slashIndex);
    const namePart = body.slice(slashIndex + 1);
    if (
      !NPM_NAME_PATTERN.test(scopePart) ||
      namePart.length === 0 ||
      namePart.includes('/') ||
      !NPM_NAME_PATTERN.test(namePart)
    ) {
      return {
        kind: 'invalid',
        reason: `invalid scoped package "${target}" — expected "@<scope>/<name>"`,
      };
    }
    return { kind: 'package', name: target };
  }

  if (target.includes('/')) {
    return {
      kind: 'invalid',
      reason: `invalid target "${target}" — unscoped package names cannot contain "/"`,
    };
  }

  if (!NPM_NAME_PATTERN.test(target)) {
    return {
      kind: 'invalid',
      reason: `invalid package name "${target}" — expected lowercase alphanumerics, ".", "-", or "_"`,
    };
  }

  return { kind: 'package', name: target };
}
