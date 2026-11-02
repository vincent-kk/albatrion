/** The report-only read records an explicit skip when provisional builds lack the getter. */
export type DivergentRead =
  | { status: 'skipped'; reason: string }
  | {
      status: 'ran';
      firstMs: number;
      repeatedMs: number;
      first: boolean;
      repeated: boolean;
    };
/** CDP heap usage is measured only after explicit garbage collection in a fresh page. */
export interface StateVocabularyReport {
  id: string;
  lane: string;
  index: number;
  edits: number;
  read?: DivergentRead;
  heap?: {
    usedSize: number;
    totalSize: number;
    embedderHeapUsedSize: number;
    backingStorageSize: number;
  };
}
declare global {
  interface Window {
    __svReport: {
      prepare(): Promise<void>;
      edit(count: number): Promise<void>;
      read(): DivergentRead;
    };
  }
}
