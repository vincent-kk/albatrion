import type {
  Blueprint,
  BlueprintCacheEntry,
  BlueprintDiagnostic,
  BlueprintOptions,
} from '../../types/blueprint';

/** Lazily retain warning records and replay them once per weakly retained collector identity. */
export function replayBlueprintDiagnostics(
  entry: BlueprintCacheEntry,
  collect: BlueprintOptions['collect'],
  gather: (
    blueprint: Blueprint,
    collector: BlueprintOptions['collect'],
  ) => void,
): void {
  if (!collect || entry.collectors.has(collect)) return;
  if (!entry.diagnostics) {
    const diagnostics: BlueprintDiagnostic[] = [];
    gather(entry.blueprint, (diagnostic) => diagnostics.push(diagnostic));
    entry.diagnostics =
      process.env.NODE_ENV !== 'production'
        ? Object.freeze(diagnostics)
        : diagnostics;
  }
  for (const diagnostic of entry.diagnostics) collect(diagnostic);
  entry.collectors.add(collect);
}
