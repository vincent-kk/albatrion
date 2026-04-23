import { readFile } from 'node:fs/promises';

import type { PkgJson } from '../type.js';

export async function readJsonOpt(path: string): Promise<PkgJson | null> {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as PkgJson;
  } catch {
    return null;
  }
}
