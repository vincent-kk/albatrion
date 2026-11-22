import { useRestProperties } from '../../hooks/useRestProperties';

/** Verify that symbol-bearing configuration objects satisfy the public generic constraint. */
export function useSymbolConfiguration() {
  const metadata = Symbol('metadata');
  const input = { label: 'item', [metadata]: { selected: true } };
  return useRestProperties(input)[metadata].selected;
}
