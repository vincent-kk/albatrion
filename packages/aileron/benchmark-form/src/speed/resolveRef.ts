import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Verifies a supplied SHA prefix against a frozen tree or Git checkout. */
export async function resolveRef(root: string, ref: string): Promise<string> {
  let sha: string;
  try {
    sha = (await readFile(join(root, '.speed-ref'), 'utf8')).trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    try {
      sha = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    } catch {
      throw new Error(`Cannot resolve ref for ${root}`);
    }
  }
  if (
    !/^[0-9a-f]{40}$/i.test(sha) ||
    !/^[0-9a-f]{7,40}$/i.test(ref) ||
    !sha.toLowerCase().startsWith(ref.toLowerCase())
  ) {
    throw new Error(`Ref ${ref} does not match the recorded SHA for ${root}`);
  }
  return sha.toLowerCase();
}
