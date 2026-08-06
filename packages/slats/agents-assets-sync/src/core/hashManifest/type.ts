import type { Sha256Hex } from '../hash/index.js';

/**
 * Where one target's source hashes come from.
 *
 * Structurally matched to `ConsumerPackage` so a renderer can pass its target
 * straight through — `core/` never imports from `commands/`, so the agreement
 * is a shape, not a dependency.
 */
export interface HashManifestSource {
  readonly name: string;
  readonly version: string;
  readonly packageRoot: string;
  /** Absolute asset directory. */
  readonly assetRoot: string;
  /** `assetRoot` relative to `packageRoot`; recorded as `assetRoot` in a computed manifest. */
  readonly assetPath: string;
  /** `directory`: hash `assetRoot` in place instead of reading `dist/`. The caller decides which source a target gets. */
  readonly hashSource: 'manifest' | 'directory';
}

/** The `agents-hashes.json` document (schema v1), however it was obtained. */
export interface HashManifest {
  schemaVersion: 1;
  package: { name: string; version: string };
  generatedAt: string;
  algorithm: 'sha256';
  /** Asset root relative to the package root. */
  assetRoot: string;
  /** Manifest path → source hash. */
  files: Record<string, Sha256Hex>;
  /** Reserved; always empty in schema v1. */
  previousVersions: Record<string, never>;
}
