import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export type Sha256Hex = string;

export function hashContent(buffer: Buffer | string): Sha256Hex {
  return createHash('sha256').update(buffer).digest('hex');
}

export async function hashFile(absPath: string): Promise<Sha256Hex | null> {
  try {
    const buf = await readFile(absPath);
    return hashContent(buf);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export function hashEquals(
  a: Sha256Hex | null,
  b: Sha256Hex | null,
): boolean {
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;
  return a.toLowerCase() === b.toLowerCase();
}
