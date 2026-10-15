// Temporary measure (round 358): internals not exported by dist are reached by copying the built bundle and appending an export; the canonical speed comparison will be whole-form e2e (Form mount and update, like benchmark-form's render lane) from M3, and internal-symbol benches stay as regression signals only.
// Loaded by standalone probes, vitest's fixture alias, and benchmark-form; only copied bundles execute.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { nodeFromJSONSchema as LegacyFactory } from '../../src/__legacy__/core/nodeFromJSONSchema';
import type {
  AuthoredSchema,
  InferFieldNode,
  SetValueOption,
  ValidationMode,
  blueprint,
  buildFieldNodeTree,
  fieldNodeFactory,
  isArrayNode,
  mountFieldNode,
} from '../../src/core';
import type {
  BEHAVIORS,
  PathKeyedMap,
  PathKeyedSet,
  loadFieldNodeAtMount,
} from '../../src/core/engine';
import type { getControlLayers } from '../../src/core/engine/settle/utils/controls/getControlLayers';
import type { getGateRegistry } from '../../src/core/engine/settle/utils/gates/getGateRegistry';
import type { sameValue } from '../../src/core/engine/utils/compute/sameValue';

type DistEngine = {
  blueprint: typeof blueprint;
  fieldNodeFactory: typeof fieldNodeFactory;
  loadFieldNodeAtMount: typeof loadFieldNodeAtMount;
  BEHAVIORS: typeof BEHAVIORS;
  PathKeyedMap: typeof PathKeyedMap;
  PathKeyedSet: typeof PathKeyedSet;
  getGateRegistry: typeof getGateRegistry;
  getControlLayers: typeof getControlLayers;
  sameValue: typeof sameValue;
  buildFieldNodeTree: typeof buildFieldNodeTree;
  mountFieldNode: typeof mountFieldNode;
  SetValueOption: typeof SetValueOption;
  ValidationMode: typeof ValidationMode;
  isArrayNode: typeof isArrayNode;
};

const internalNames = [
  'blueprint',
  'fieldNodeFactory',
  'loadFieldNodeAtMount',
  'BEHAVIORS',
  'PathKeyedMap',
  'PathKeyedSet',
  'getGateRegistry',
  'getControlLayers',
  'selectChildren',
  'sameValue',
  'mountFieldNode',
  'buildFieldNodeTree',
] as const;
const defaultDirectory = fileURLToPath(
  new URL('../.results/dist-engine/', import.meta.url),
);

/** Copy unchanged bundle bytes and append exactly one export line in an ignored directory. */
async function copyAndLoad<Module>(
  sourcePath: string,
  directory: string,
  label: string,
  names: readonly string[],
  exportLine: string,
): Promise<{ module: Module; digest: string }> {
  const source = fs.readFileSync(sourcePath, 'utf8');
  for (const name of names)
    if (
      !new RegExp(
        `^(?:const|let|var|function|class) ${name}(?:[ (=;])`,
        'm',
      ).test(source)
    )
      throw new Error(`Dist declaration unavailable: ${name} in ${sourcePath}`);
  const digest = createHash('sha256').update(source).digest('hex');
  fs.mkdirSync(directory, { recursive: true });
  const destination = path.join(directory, `${label}-${digest}.mjs`);
  fs.writeFileSync(destination, `${source}\n${exportLine}\n`);
  const module: Module = await import(
    /* @vite-ignore */ pathToFileURL(destination).href
  );
  return { module, digest };
}

/** Load the workspace dist engine and compose the same mounted-tree factory used by tests. */
export async function loadDistEngine(directory = defaultDirectory) {
  const { module, digest } = await copyAndLoad<DistEngine>(
    fileURLToPath(new URL('../../dist/index.mjs', import.meta.url)),
    directory,
    'workspace',
    internalNames,
    `export { ${internalNames.join(', ')} };`,
  );
  function create<Schema extends AuthoredSchema>(
    props: Parameters<typeof buildFieldNodeTree<Schema>>[0] & {
      deferMountValidation?: boolean;
    },
  ): InferFieldNode<Schema> {
    const root = module.buildFieldNodeTree<Schema>(props);
    module.mountFieldNode(root, undefined, undefined, {
      deferValidation: props.deferMountValidation ?? false,
    });
    return root;
  }
  return { ...module, create, distSha256: digest };
}

/** Published legacy releases installed under benchmark-form's version aliases. */
export type LegacyVersion = '0.16.0' | '0.16.1';

/**
 * Load a published legacy ESM bundle used by the equivalent lane.
 * @param directory - Ignored directory receiving the copied bundle
 * @param version - Installed legacy alias to load; the newest published 0.16.x by default
 * @returns The legacy tree factory and the sha256 of the unchanged bundle bytes
 * @throws When the bundle no longer declares `nodeFromJSONSchema`
 */
export async function loadLegacyEngine(
  directory = defaultDirectory,
  version: LegacyVersion = '0.16.1',
): Promise<{
  create: typeof LegacyFactory;
  legacySha256: string;
}> {
  const { module, digest } = await copyAndLoad<{
    benchmarkCore: typeof LegacyFactory;
  }>(
    fileURLToPath(
      version === '0.16.0'
        ? import.meta.resolve('@canard/schema-form_0.16.0')
        : import.meta.resolve('@canard/schema-form_0.16.1'),
    ),
    directory,
    version,
    ['nodeFromJSONSchema'],
    'export { nodeFromJSONSchema as benchmarkCore };',
  );
  return { create: module.benchmarkCore, legacySha256: digest };
}
