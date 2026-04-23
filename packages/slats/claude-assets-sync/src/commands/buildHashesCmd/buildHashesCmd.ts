import { buildHashes as buildHashesImpl } from '../../../scripts/buildHashes.mjs';
import { logger } from '../../utils/logger.js';

export interface BuildHashesCmdOptions {
  packageRoot: string;
}

export async function buildHashesCmd(
  opts: BuildHashesCmdOptions,
): Promise<void> {
  try {
    const { outPath, fileCount } = await buildHashesImpl({
      packageRoot: opts.packageRoot,
    });
    logger.success(
      `${logger.accent('claude-hashes.json')} written: ${fileCount} file(s) → ${outPath}`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`buildHashes failed: ${msg}`);
    process.exit(1);
  }
}
