import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findWorkspaceOwner } from "./findWorkspaceOwner.mjs";

/**
 * Adds tracked source imports to manifest edges, including test-only cycles.
 * Comments and strings may add harmless extra selection edges.
 * @param {string} root Checkout directory for source reads.
 * @param {string[]} files Tracked repository-relative paths.
 * @param {object[]} workspaces Named manifests with dependency lists.
 * @returns {object[]} New workspace records carrying selectionDependencies.
 */
export function scanImportDependencies(root, files, workspaces) {
  const edges = new Map(
    workspaces.map((workspace) => [
      workspace.name,
      new Set(workspace.dependencies),
    ]),
  );
  for (const file of files.filter((path) => /\.[cm]?[jt]sx?$/.test(path))) {
    const owner = findWorkspaceOwner(file, workspaces);
    if (!owner) continue;
    const source = readFileSync(join(root, file), "utf8");
    const specifiers = source.matchAll(
      /\b(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)['"]([^'"\n]+)['"]/g,
    );
    for (const [, specifier] of specifiers) {
      const name = specifier.startsWith("@")
        ? specifier.split("/").slice(0, 2).join("/")
        : specifier.split("/")[0];
      if (name !== owner.name && edges.has(name))
        edges.get(owner.name).add(name);
    }
  }
  return workspaces.map((workspace) => ({
    ...workspace,
    selectionDependencies: [...edges.get(workspace.name)].sort(),
  }));
}
