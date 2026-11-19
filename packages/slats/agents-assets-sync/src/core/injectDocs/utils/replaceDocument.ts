import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * Atomically replaces a document without truncating the user's original on failure.
 * @param fileAbs - Absolute destination, following an existing user-scope file link.
 * @param content - Complete replacement bytes.
 * @returns Resolves after rename; any failure leaves the original intact.
 */
export async function replaceDocument(
  fileAbs: string,
  content: Buffer,
): Promise<void> {
  const destination = await realpath(fileAbs).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT')
        return lstat(fileAbs).then(
          (entry) => {
            if (entry.isSymbolicLink())
              throw new Error(`Dangling document link: ${fileAbs}`);
            return fileAbs;
          },
          (failure: NodeJS.ErrnoException) => {
            if (failure.code === 'ENOENT') return fileAbs;
            throw failure;
          },
        );
      throw error;
    },
  );
  await mkdir(dirname(destination), { recursive: true });
  const mode = await stat(destination).then(
    (entry) => entry.mode,
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return undefined;
      throw error;
    },
  );
  if (mode !== undefined && (mode & 0o222) === 0)
    throw new Error(`Document is read-only: ${fileAbs}`);
  const temporary = await mkdtemp(
    join(dirname(destination), '.agents-assets-sync-'),
  );
  try {
    const path = join(temporary, 'document');
    await writeFile(path, content, { mode });
    if (mode !== undefined) await chmod(path, mode & 0o7777);
    await rename(path, destination);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
