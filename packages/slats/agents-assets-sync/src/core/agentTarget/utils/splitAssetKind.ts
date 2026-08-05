import type { AssetKind } from '../type.js';

const KINDS: readonly AssetKind[] = ['skills', 'rules', 'commands'];

/**
 * Split a manifest path into the asset kind it belongs to and the path below
 * that kind.
 *
 * @param relPath - POSIX-separated manifest path, e.g. `skills/foo/SKILL.md`
 * @returns the kind and the remainder, or `null` when the leading segment
 *   names no known kind or nothing follows it
 */
export function splitAssetKind(
  relPath: string,
): { kind: AssetKind; rest: string } | null {
  const separator = relPath.indexOf('/');
  if (separator <= 0) return null;
  const head = relPath.slice(0, separator) as AssetKind;
  if (!KINDS.includes(head)) return null;
  const rest = relPath.slice(separator + 1);
  return rest.length > 0 ? { kind: head, rest } : null;
}
