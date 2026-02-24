import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Reads all dependencies from the project's package.json
 * (dependencies, devDependencies, peerDependencies, optionalDependencies)
 */
export function readProjectDependencies(cwd: string): Record<string, string> {
  const pkgPath = path.join(cwd, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found at: ${pkgPath}`);
  }

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch (error) {
    throw new Error(
      `Failed to parse package.json at ${pkgPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
    ...(pkg.peerDependencies as Record<string, string> | undefined),
    ...(pkg.optionalDependencies as Record<string, string> | undefined),
  };
}

/**
 * Filters dependency names by regex pattern.
 * Wraps RegExp construction in try/catch for invalid patterns.
 */
export function filterByPattern(
  deps: Record<string, string>,
  pattern: string,
): string[] {
  let regex: RegExp;
  try {
    regex = new RegExp(pattern);
  } catch (error) {
    throw new Error(
      `Invalid regex pattern "${pattern}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return Object.keys(deps).filter(name => regex.test(name));
}
