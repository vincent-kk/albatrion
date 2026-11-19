import type { ConsumerPackage, DefaultFlags } from '../../../../types/index.js';
import type { AgentTarget, AgentType, AssetKind } from '../../../agentTarget/index.js';
import type { Scope } from '../../../scope/index.js';
import type { InjectPlan } from '../../../buildPlan/index.js';
import type { InjectReport } from '../../type.js';

/** One stable unit of a run, shared by every output view. */
export interface RunUnit {
  readonly key: string;
  readonly target: ConsumerPackage;
  readonly agentTarget: AgentTarget;
  readonly plan: InjectPlan;
  readonly error?: string;
  readonly report?: InjectReport;
}
/** Complete execution result; views never derive its exit code. */
export interface RunResult {
  readonly units: readonly RunUnit[];
  readonly errors: readonly string[];
  readonly exitCode: 0 | 1 | 2;
  readonly dryRun: boolean;
}
/** Completed and validated input vocabulary. */
export interface ValidatedFlags {
  readonly agents: readonly AgentType[];
  readonly scope: Scope;
  readonly assetKinds: ReadonlySet<AssetKind>;
}
/** Input requests carry values only, with no filesystem authority. */
export interface RunInput {
  readonly targets: readonly ConsumerPackage[];
  readonly flags: DefaultFlags;
  readonly originCwd: string;
  readonly notices?: readonly string[];
  readonly selectAgents?: () => Promise<readonly AgentType[]>;
  readonly selectScope?: () => Promise<Scope>;
  readonly confirm?: (units: readonly RunUnit[]) => Promise<boolean>;
  readonly onPlan?: (units: readonly RunUnit[], values: ValidatedFlags) => void;
}
