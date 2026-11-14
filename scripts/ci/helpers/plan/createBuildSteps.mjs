import { collectClosure } from "../selection/collectClosure.mjs";
import { createTopologicalBuild } from "./helpers/createTopologicalBuild.mjs";

/**
 * Emits manifest-topological builds with the schema-form bootstrap and the plugin packages its tests import (AJV 6/7/8, antd5).
 * @param {string[]} affected Names whose build dependencies must exist.
 * @param {object[]} workspaces Manifest dependency graph and current scripts.
 * @returns {object[]} Yarn commands restricted to eligible build workspaces.
 */
export function createBuildSteps(affected, workspaces) {
  const closure = collectClosure(affected, workspaces);
  const schemaForm = "@canard/schema-form";
  const ajvPlugins = [6, 7, 8].map(
    (version) => `@canard/schema-form-ajv${version}-plugin`,
  );
  const bootstrapPlugins = [...ajvPlugins, "@canard/schema-form-antd5-plugin"];
  if (closure.includes(schemaForm)) {
    for (const name of collectClosure(bootstrapPlugins, workspaces))
      if (!closure.includes(name)) closure.push(name);
  }
  const buildNames = closure
    .filter(
      (name) =>
        workspaces.find((workspace) => workspace.name === name)?.scripts.build,
    )
    .filter(
      (name) =>
        name !== "@albatrion/documents" &&
        (name !== "@aileron/production-testbed" || affected.includes(name)),
    )
    .sort();
  const steps = [];
  let remainingBuildNames = buildNames;
  if (buildNames.includes(schemaForm)) {
    const prerequisites = collectClosure(
      [schemaForm, ...bootstrapPlugins],
      workspaces,
    ).filter(
      (name) =>
        name !== schemaForm &&
        !bootstrapPlugins.includes(name) &&
        buildNames.includes(name),
    );
    if (prerequisites.length)
      steps.push(
        createTopologicalBuild(
          prerequisites,
          "Build schema-form prerequisites",
        ),
      );
    // schema-form typechecks and render tests import the AJV and antd5 plugin builds, whose own types require schema-form first.
    steps.push({
      kind: "build",
      label: "Bootstrap schema-form runtime",
      args: ["workspace", schemaForm, "exec", "rolldown", "-c"],
    });
    steps.push({
      kind: "build",
      label: "Bootstrap schema-form declarations",
      args: ["workspace", schemaForm, "build:types"],
    });
    steps.push(
      createTopologicalBuild(
        bootstrapPlugins.filter((name) => buildNames.includes(name)),
        "Build schema-form plugin declarations",
      ),
    );
    remainingBuildNames = buildNames.filter(
      (name) =>
        !prerequisites.includes(name) && !bootstrapPlugins.includes(name),
    );
  }
  if (remainingBuildNames.length)
    steps.push(
      createTopologicalBuild(remainingBuildNames, "Build workspace closure"),
    );
  return steps;
}
