import {
  chmod,
  chown,
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
 * Replaces a document atomically when identity can be reproduced, otherwise in place.
 * @param fileAbs - Absolute destination, following an existing user-scope file link.
 * @param content - Complete replacement bytes.
 * @param initialMode - Source permission bits for a destination that does not exist.
 * @param independent - Require an independent regular file for an ownership record.
 * @returns Resolves after writing; in-place fallback is not crash-atomic.
 */
export async function replaceDocument(
  fileAbs: string,
  content: Buffer,
  initialMode?: number,
  independent = false,
): Promise<void> {
  const destination = independent ? fileAbs : await realpath(fileAbs).catch(
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
  const entry = await (independent ? lstat(destination) : stat(destination)).then(
    (entry) => entry,
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return undefined;
      throw error;
    },
  );
  if (independent && entry && (!entry.isFile() || entry.nlink !== 1))
    throw new Error(`Installed asset record is not an independent file: ${fileAbs}`);
  const mode = entry?.mode ?? initialMode;
  if (entry && (entry.mode & 0o222) === 0)
    throw new Error(`Document is read-only: ${fileAbs}`);
  if (entry && entry.nlink > 1) {
    await writeFile(destination, content);
    return;
  }
  const temporary = await mkdtemp(
    join(dirname(destination), '.agents-assets-sync-'),
  );
  try {
    const path = join(temporary, 'document');
    await writeFile(path, content, { mode });
    if (entry) {
      try {
        await chown(path, entry.uid, entry.gid);
        await chmod(path, entry.mode & 0o7777);
      } catch (error) {
        if (
          independent ||
          !(error instanceof Error) ||
          !('code' in error) ||
          !['EPERM', 'EACCES', 'ENOSYS', 'ENOTSUP', 'EOPNOTSUPP'].includes(
            String(error.code),
          )
        )
          throw error;
        await writeFile(destination, content);
        return;
      }
    }
    if (!entry && mode !== undefined) await chmod(path, mode & 0o7777);
    await rename(path, destination);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
