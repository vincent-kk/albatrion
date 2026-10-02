import type { FormHandle, FormTypeInputProps } from '../../../src';

export interface BrowserGateObservations {
  mounts: Record<string, number>;
  changes: unknown[];
  warnings: string[];
  childReads: { detectedMs: number; plainMs: number; reads: number }[];
  inputs: Record<string, FormTypeInputProps>;
}

export interface BrowserGateElement extends HTMLDivElement {
  gate?: { handle: FormHandle; observations: BrowserGateObservations };
}
