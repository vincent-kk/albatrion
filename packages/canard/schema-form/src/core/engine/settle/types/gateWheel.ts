import type { Optional } from '@aileron/declare';

import type { BlueprintGate } from '../../blueprint';

/** Reads of one relocated gate occurrence at its latest evaluation in this settlement. */
export interface RelocatedGateReads {
  /** Absolute dependency paths in expression order; '@' for the binding context. */
  paths: readonly string[];
  /** Values that evaluation observed at those paths. */
  values: readonly unknown[];
}

/** One actual input read; only the current host wheel retains its value. */
export interface GateWheelInput {
  /** Absolute dependency or host path, or '@' for the binding context. */
  path: string;
  /** Channel whose value must remain identical at the confirmation boundary. */
  kind: 'value' | 'extra' | 'context' | 'property' | 'presence';
  /** Prepared input-site identity, avoiding channel-key construction per evaluation. */
  key?: string;
  /** Full host pointer for an if property's merged projection and extras. */
  hostPath?: string;
  /** Own property name whose value or existence the predicate observes. */
  name?: string;
  /** Reference or primitive observed by the actual gate evaluation. */
  value: unknown;
}

/** Recursive host frames never share inputs or shadow evaluation sequences. */
export interface GateWheelFrame {
  /** Successful positional decisions reusable only by proven-stable table steps. */
  predicateResults?: Map<object, boolean>;
  /** First actual input at each distinct channel and path in this host wheel. */
  inputs: Map<string, GateWheelInput>;
  /** Whether every repeated read at an input site was Object.is-identical. */
  consistent: boolean;
  /** Registered gate count at the beginning of this host wheel. */
  gateCount: number;
  /** Settlement gate exception version at the beginning of this host wheel. */
  throwVersion: Optional<number>;
  /** Independent full-evaluation inputs for table selection's verify mode. */
  selectionShadow?: Pick<GateWheelFrame, 'inputs' | 'consistent'>;
  /** Actual evaluation sequence retained only for shadow confirmation. */
  evaluations?: {
    /** Bound condition evaluated at this position, including prerequisites. */
    gate: BlueprintGate;
    /** Live occurrence path of the owner that evaluated the condition. */
    path: string;
    /** Direct child selected by a node gate, absent for a host gate. */
    edgeName: Optional<string>;
    /** Actual boolean result to compare with the confirmation wheel. */
    value: boolean;
  }[];
}
