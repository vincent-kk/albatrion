import type { ConsumerPackage, DefaultFlags } from '../../../../types/index.js';
import type {
  AgentTarget,
  AgentType,
  AssetKind,
} from '../../../agentTarget/index.js';
import type { InjectPlan } from '../../../buildPlan/index.js';
import type { Scope } from '../../../scope/index.js';
import type { RuleSource } from '../../../types/ruleSource.js';
import type { InjectReport } from '../../type.js';

/** One failure or protective notice shared by every display. */
export interface RunFailure {
  /** Stable participant or requested target identifier. */
  readonly unitKey: string;
  /** Absolute source/destination path, or unresolved request. */
  readonly path: string;
  /** Stage that owns the diagnostic. */
  readonly stage: 'discover' | 'gate' | 'prepare' | 'merge' | 'apply';
  /** Complete underlying reason, without renderer-specific rewriting. */
  readonly reason: string;
}

/** One stable unit of a run, shared by every output view. */
export interface RunUnit {
  readonly key: string;
  /** Earlier unit that owns this same destination; this alias has no actions. */
  readonly aliasOf?: string;
  readonly target: ConsumerPackage;
  readonly agentTarget: AgentTarget;
  readonly plan: InjectPlan;
  /** Planned actions are diagnostic evidence and cannot execute. */
  readonly refused?: boolean;
  readonly error?: string;
  readonly report?: InjectReport;
  readonly failures?: readonly RunFailure[];
  readonly notices?: readonly RunFailure[];
  /** Physical roots whose ownership may be incomplete if this participant fails. */
  readonly namespaceRoots?: readonly string[];
  /** Preparation-only cache; execution omits it from the final report. */
  readonly ruleSources?: ReadonlyMap<string, RuleSource | null>;
}
/** Complete execution result; views never derive its exit code. */
export interface RunResult {
  readonly units: readonly RunUnit[];
  readonly errors: readonly string[];
  readonly exitCode: 0 | 1 | 2;
  readonly dryRun: boolean;
  readonly failures?: readonly RunFailure[];
  readonly notices?: readonly RunFailure[];
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
  /** Structured records supplied by discovery, before any namespace is planned. */
  readonly diagnostics?: readonly RunFailure[];
  readonly selectAgents?: () => Promise<readonly AgentType[]>;
  readonly selectScope?: () => Promise<Scope>;
  readonly confirm?: (units: readonly RunUnit[]) => Promise<boolean>;
  readonly onPlan?: (units: readonly RunUnit[], values: ValidatedFlags) => void;
}

/** Legacy prepared input can omit its identity; core supplies it once. */
export type PreparedUnit = Omit<RunUnit, 'key'> & { readonly key?: string };
