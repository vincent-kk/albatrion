import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { matchWorkspacePattern } from "./matchWorkspacePattern.mjs";

/**
 * Reads named workspaces from tracked manifests matching the root patterns.
 * @param {string} root Checkout directory containing the root manifest.
 * @param {string[]} files Tracked POSIX paths.
 * @returns {object[]} Named manifests with paths, scripts and manifest dependency edges.
 */
export function readWorkspaces(root, files) {
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const patterns = Array.isArray(manifest.workspaces)
    ? manifest.workspaces
    : manifest.workspaces.packages;
  const workspaces = files
    .filter((file) => file.endsWith("/package.json"))
    .filter((file) =>
      patterns.some((pattern) => matchWorkspacePattern(dirname(file), pattern)),
    )
    .map((file) => ({
      ...JSON.parse(readFileSync(join(root, file), "utf8")),
      directory: dirname(file),
    }));
  const names = workspaces.map(({ name }) => name);
  if (names.some((name, index) => !name || names.indexOf(name) !== index))
    throw new Error("Workspace names must be unique and nonempty");
  return workspaces
    .map((workspace) => ({
      ...workspace,
      scripts: workspace.scripts ?? {},
      dependencies: Object.keys({
        ...workspace.dependencies,
        ...workspace.devDependencies,
        ...workspace.peerDependencies,
      })
        .filter((name) => names.includes(name))
        .sort(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}
