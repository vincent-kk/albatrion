import { homedir } from 'node:os';
import { join } from 'node:path';

export type Scope = 'user' | 'project' | 'local';

export interface ScopeResolution {
  scope: Scope;
  targetRoot: string;
  isGitIgnoredRegion: boolean;
  description: string;
}

export function isValidScope(value: unknown): value is Scope {
  return value === 'user' || value === 'project' || value === 'local';
}

export function resolveScope(
  scope: Scope,
  cwd: string = process.cwd(),
): ScopeResolution {
  if (scope === 'user') {
    return {
      scope,
      targetRoot: join(homedir(), '.claude'),
      isGitIgnoredRegion: false,
      description: '~/.claude (user)',
    };
  }
  if (scope === 'project') {
    return {
      scope,
      targetRoot: join(cwd, '.claude'),
      isGitIgnoredRegion: false,
      description: `${cwd}/.claude (project)`,
    };
  }
  return {
    scope,
    targetRoot: join(cwd, '.claude'),
    isGitIgnoredRegion: true,
    description: `${cwd}/.claude (local, expected to be gitignored)`,
  };
}

export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
