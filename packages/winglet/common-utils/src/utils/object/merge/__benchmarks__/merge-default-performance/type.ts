/** A mutable target is freshly allocated for every measured merge call. */
export interface MergePerformanceFixture {
  readonly name: string;
  readonly source: Record<string, any>;
  readonly createTarget: () => Record<string, any>;
  readonly consume: (result: Record<string, any>) => number;
}
