import type { RunFailure, RunResult } from '../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';

export interface RenderInput {
  /** Already computed preflight result, displayed without starting a run. */
  readonly result?: RunResult;
  /** Preflight diagnostics also protect namespaces owned by failed participants. */
  readonly diagnostics?: readonly RunFailure[];
  readonly notices?: readonly string[];
  readonly targets: readonly ConsumerPackage[];
  readonly flags: DefaultFlags;
  readonly originCwd: string;
}
