import type { FieldInputProps, FormHandle } from '../../../src';

export interface BrowserGateObservations {
  mounts: Record<string, number>;
  changes: unknown[];
  warnings: string[];
  childReads: { detectedMs: number; plainMs: number; reads: number }[];
  inputs: Record<string, FieldInputProps>;
}

export interface BrowserGateElement extends HTMLDivElement {
  gate?: { handle: FormHandle; observations: BrowserGateObservations };
}
