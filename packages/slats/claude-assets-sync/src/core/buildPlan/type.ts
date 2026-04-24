import type { Sha256Hex } from '../hash/index.js';

export type Action =
  | { kind: 'copy'; relPath: string; dstAbs: string }
  | { kind: 'skip-uptodate'; relPath: string; dstAbs: string }
  | { kind: 'warn-diverged'; relPath: string; dstAbs: string }
  | { kind: 'warn-orphan'; relPath: string; dstAbs: string }
  | { kind: 'delete'; relPath: string; dstAbs: string };

export interface InjectPlan {
  actions: Action[];
  requiresForce: boolean;
}

export interface PlanInput {
  sourceHashes: Record<string, Sha256Hex>;
  targetRoot: string;
  namespacePrefixes: string[];
  force: boolean;
}
