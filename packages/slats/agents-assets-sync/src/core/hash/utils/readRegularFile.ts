import { constants } from 'node:fs';
import { open } from 'node:fs/promises';

/**
 * Read through an open handle that cannot follow a symbolic link at its name.
 * @param path Absolute file path whose parent is already checked for containment.
 * @param independent Reject links and non-files when reading the record itself.
 * @returns Recorded bytes, or null for a missing file or ineligible orphan proof.
 */
export async function readRegularFile(
  path: string,
  independent = false,
): Promise<Buffer | null> {
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT' || (!independent && error.code === 'ELOOP')) return null;
      throw error;
    },
  );
  if (!handle) return null;
  try {
    const entry = await handle.stat();
    if (entry.isFile() && (!independent || entry.nlink === 1))
      return await handle.readFile();
    if (!independent) return null;
    throw new Error(`Installed asset record is not an independent file: ${path}`);
  } finally {
    await handle.close();
  }
}
