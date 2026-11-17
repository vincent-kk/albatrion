/** Every dependency comes from the selected package source snapshot. */
export interface SnapshotModuleState {
  readonly revision: string;
  readonly packageRoot: string;
  readonly paths: ReadonlySet<string>;
  readonly modules: Map<string, { exports: Record<string, unknown> }>;
  readonly sourceHashes: Map<string, string>;
}
