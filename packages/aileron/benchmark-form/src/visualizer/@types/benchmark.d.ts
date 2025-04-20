declare interface BenchmarkStats {
  mean: number;
  deviation: number;
}

declare interface BenchmarkResult {
  name: string;
  hz: number;
  stats: BenchmarkStats;
}

declare interface BenchmarkReport {
  timestamp: string;
  results: BenchmarkResult[];
}
