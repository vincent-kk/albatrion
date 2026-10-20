import type { BlueprintGate } from '../../blueprint';

/** One actual input read; only the current host wheel retains its value. */
export interface GateWheelInput {
  path: string;
  kind: 'value' | 'extra' | 'context';
  value: unknown;
}

/** Recursive host frames never share inputs or shadow evaluation sequences. */
export interface GateWheelFrame {
  inputs: Map<string, GateWheelInput>;
  consistent: boolean;
  gateCount: number;
  throwVersion: number | undefined;
  evaluations?: {
    gate: BlueprintGate;
    path: string;
    edgeName: string | undefined;
    value: boolean;
  }[];
}
