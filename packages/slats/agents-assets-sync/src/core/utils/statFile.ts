import { stat } from 'node:fs/promises';

/**
 * Read exact file identity for alias and hard-link ownership decisions.
 * @param path Absolute destination path.
 * @returns File statistics, or undefined if no file occupies the location.
 */
export async function statFile(path: string) {
  try {
    const entry = await stat(path, { bigint: true });
    return entry.isFile() ? entry : undefined;
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
      throw error;
    return undefined;
  }
}
