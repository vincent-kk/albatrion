export interface InjectReport {
  created: string[];
  updated: string[];
  skipped: string[];
  warnings: { relPath: string; reason: string }[];
  deleted: string[];
  exitCode: 0 | 1 | 2;
}
