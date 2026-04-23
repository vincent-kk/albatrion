export interface ConsumerPackage {
  name: string;
  version: string;
  packageRoot: string;
  assetRoot: string;
  hashesPresent: boolean;
}

export interface DiscoverOptions {
  cwd?: string;
  includeWorkspaces?: boolean;
}

export interface PkgJson {
  name?: string;
  version?: string;
  claude?: { assetPath?: string };
  workspaces?: string[] | { packages?: string[] };
}
