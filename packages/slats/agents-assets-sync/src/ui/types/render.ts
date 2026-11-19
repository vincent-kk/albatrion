import type { RunResult } from '../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';

export interface RenderInput {
  /** Already computed preflight result, displayed without starting a run. */
  readonly result?: RunResult;
  readonly targets: readonly ConsumerPackage[];
  readonly flags: DefaultFlags;
  readonly originCwd: string;
}
