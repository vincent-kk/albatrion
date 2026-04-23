import type { InjectPlan } from '../buildPlan/index.js';
import type { Scope } from '../scope/index.js';

export interface InjectOptions {
  packageName: string;
  packageVersion: string;
  packageRoot: string;
  assetRoot: string;
  scope: Scope;
  dryRun: boolean;
  force: boolean;
  /**
   * Origin directory used to resolve project/local scope targets. When set,
   * `resolveScope` walks up from this path to find the nearest existing
   * `.claude` ancestor. Defaults to `process.cwd()`.
   */
  originCwd?: string;
  /** Called AFTER plan is built but BEFORE apply. Return false to abort. */
  confirmForce?: (plan: InjectPlan) => Promise<boolean>;
}

export interface InjectReport {
  created: string[];
  updated: string[];
  skipped: string[];
  warnings: { relPath: string; reason: string }[];
  deleted: string[];
  exitCode: 0 | 1 | 2;
}
