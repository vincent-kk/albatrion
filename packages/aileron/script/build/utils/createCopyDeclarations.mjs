/**
 * Rolldown plugin that copies the shared `@aileron/declare` ambient types into
 * a package's output directory.
 *
 * Why this exists: `@aileron/*` is a tsconfig `paths` alias pointing at
 * `packages/aileron/common/*`, which holds .d.ts files only. Those types are
 * erased from the emitted JavaScript, but the published .d.ts files still
 * reference them, so each package ships its own flattened copy at
 * `<outDir>/@aileron/declare/*.d.ts`. The declaration build resolves the alias
 * against that copy (see each package's tsconfig.declarations.json, which maps
 * `@aileron/*` to `./dist/@aileron/*`).
 *
 * Hand-rolled on purpose: the whole requirement is one flattened, idempotent
 * transfer of a handful of .d.ts files, which is less code than configuring a
 * general-purpose copy plugin.
 */
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** @type {(dir: string) => string[]} */
const collectDeclarationFiles = (dir) => {
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...collectDeclarationFiles(fullPath));
    else if (entry.name.endsWith('.d.ts')) found.push(fullPath);
  }
  return found;
};

/**
 * @type {(options: { sourceDir: string; targetDir: string }) => import('rolldown').Plugin}
 */
export const createCopyDeclarations = ({ sourceDir, targetDir }) => ({
  name: 'copy-declarations',
  buildEnd() {
    const files = collectDeclarationFiles(sourceDir);
    if (files.length === 0) return;

    mkdirSync(targetDir, { recursive: true });
    // Flattened on purpose: consumers import `@aileron/declare`, so the nested
    // layout under aileron/common is intentionally collapsed.
    for (const file of files)
      copyFileSync(
        file,
        join(targetDir, file.slice(file.lastIndexOf('/') + 1)),
      );
  },
});
