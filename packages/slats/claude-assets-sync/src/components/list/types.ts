export type ListPhase =
  | 'loading'
  | 'main-menu'
  | 'package-list'
  | 'package-detail'
  | 'sync-action'
  | 'remove-action'
  | 'update-action'
  | 'edit-assets'
  | 'status-view'
  | 'confirming'
  | 'done'
  | 'error';

export interface SelectItem {
  label: string;
  value: string;
}

export interface PackageDetailInfo {
  prefix: string;
  originalName: string;
  version: string;
  local: boolean;
  syncedAt?: string;
  files: Record<string, any[]>;
  totalAssets: number;
}
