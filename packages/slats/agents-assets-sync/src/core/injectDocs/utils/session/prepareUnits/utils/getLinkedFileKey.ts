import { stat } from 'node:fs/promises';

/**
 * Identify an existing shared inode independently of any one directory entry.
 * @param path Resolved destination path.
 * @returns A device/inode key for linked files, or undefined for independent or missing files.
 */
export async function getLinkedFileKey(
  path: string,
): Promise<string | undefined> {
  try {
    const entry = await stat(path, { bigint: true });
    if (entry.isFile() && entry.nlink > 1n)
      return `inode:${entry.dev}:${entry.ino}`;
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
      throw error;
  }
  return undefined;
}
