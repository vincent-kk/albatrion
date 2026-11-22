import { basename, dirname, join } from 'node:path';

import type {
  ConsumerPackage,
  DefaultFlags,
} from '../../../../../types/index.js';
import {
  type ResolvedLocations,
  assertProjectPathsContained,
  resolveAgentTarget,
  resolveDestinations,
} from '../../../../agentTarget/index.js';
import {
  INSTALLED_HASH,
  buildPlan,
  collectFileWrites,
} from '../../../../buildPlan/index.js';
import {
  computeNamespacePrefixes,
  resolveHashManifest,
} from '../../../../hashManifest/index.js';
import type { SourceSnapshot } from '../../../../types/sourceSnapshot.js';
import { statFile } from '../../../../utils/statFile.js';
import { mergePlans } from '../mergePlans.js';
import type { RunUnit, ValidatedFlags } from '../types.js';
import {
  type InstalledAssets,
  openInstalledAssets,
} from '../utils/openInstalledAssets.js';
import { describePreparationFailure } from './utils/describePreparationFailure.js';
import { resolveCanonicalPath } from './utils/resolveCanonicalPath.js';
import { validateUnitMarkdown } from './utils/validateUnitMarkdown.js';

/** Read all inputs and prepare all units before any destination is written.
 * @param targets Deduplicated packages.
 * @param values Validated arguments.
 * @param flags Execution options.
 * @param cwd Scope resolution origin.
 * @returns Run-wide merged plans, including failed units.
 */
export async function prepareUnits(
  targets: readonly ConsumerPackage[],
  values: ValidatedFlags,
  flags: DefaultFlags,
  cwd: string,
  discoveryFailures: readonly string[] = [],
): Promise<RunUnit[]> {
  const units: RunUnit[] = [];
  const resolved: ResolvedLocations = new Map();
  const destinationsSeen = new Map<string, RunUnit>();
  const markdown = new Map<string, Promise<void>>();
  const linkedDestinations = new Map<string, string>();
  const physicalPaths = new Map<string, Promise<string>>();
  const generatedAt = new Date().toISOString();
  const sourceSnapshots = new Map<string, SourceSnapshot | null>();
  const installedRecords = new Map<string, InstalledAssets>();
  for (const target of targets) {
    const manifest = await resolveHashManifest(
      target,
      generatedAt,
      sourceSnapshots,
    ).then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    for (const agent of values.agents) {
      const agentTarget = resolveAgentTarget(agent, values.scope, cwd);
      const locationKey = JSON.stringify([
        target.name,
        agentTarget.scope,
        agentTarget.directoryRoots,
        agentTarget.rulesMergeFile,
        agentTarget.unsupported,
      ]);
      const existing = destinationsSeen.get(locationKey);
      if (existing) {
        units.push({
          ...existing,
          key: `${agent}:${target.name}`,
          agentTarget,
          aliasOf: existing.key,
          sharedRetirements: undefined,
          plan: { actions: [], requiresForce: false },
        });
        continue;
      }
      const base = {
        key: `${agent}:${target.name}`,
        target,
        agentTarget,
      };
      let namespaceRoots: string[] | undefined;
      try {
        if ('error' in manifest) throw manifest.error;
        const prefixes = computeNamespacePrefixes(manifest.value);
        namespaceRoots = Object.entries(agentTarget.directoryRoots).flatMap(
          ([kind, root]) => {
            if (!root) return [];
            return kind === 'skills'
              ? prefixes.map((prefix) => join(root, prefix.slice('skills/'.length)))
              : [root];
          },
        );
        const recordPath = agentTarget.installedAssetsFile;
        let installed: InstalledAssets | undefined;
        if (
          values.assetKinds.has('skills') ||
          (values.assetKinds.has('rules') && agentTarget.rulesMergeFile === null)
        ) {
          await assertProjectPathsContained({
            agentTarget,
            dstPaths: [recordPath],
            resolved,
          });
          const physicalRecord = join(
            await resolveCanonicalPath(dirname(recordPath), physicalPaths),
            basename(recordPath),
          );
          installed = installedRecords.get(physicalRecord);
          if (installed === undefined) {
            installed = await openInstalledAssets(recordPath);
            installedRecords.set(physicalRecord, installed);
          }
        }
        const { destinations, orphanScans: scans } = resolveDestinations(
          {
            agentTarget,
            packageName: target.name,
            relPaths: Object.keys(manifest.value.files),
            namespacePrefixes: prefixes,
            assetKinds: values.assetKinds,
          },
          installed?.previousPaths(target.name),
        );
        const sharedRetirements: string[] = [];
        const orphanScans = scans.filter((scan) => {
          if (
            scan.kind !== 'installed-file' ||
            !installed?.hasPeerPath(target.name, scan.relPath)
          )
            return true;
          sharedRetirements.push(scan.relPath);
          return false;
        });
        await assertProjectPathsContained({
          agentTarget,
          assetKinds: values.assetKinds,
          orphanScans,
          resolved,
        });
        const formerFiles = orphanScans.flatMap((scan) =>
          scan.kind === 'installed-file' ? [scan.dstAbs] : [],
        );
        if (formerFiles.length)
          await assertProjectPathsContained({ agentTarget, dstPaths: formerFiles, resolved });
        const plan = await buildPlan({
          sourceHashes: manifest.value.files,
          ruleBodyHashes: manifest.value.ruleBodyHashes,
          sourceSnapshots,
          assetRoot: target.assetRoot,
          destinations,
          orphanScans,
          force: Boolean(flags.force),
        });
        await validateUnitMarkdown(
          plan,
          target.assetRoot,
          markdown,
          sourceSnapshots,
        );
        await assertProjectPathsContained({
          agentTarget,
          dstPaths: collectFileWrites(plan),
          resolved,
        });
        const resolvedActions = await Promise.all(
          plan.actions.map(async (action) => {
            if (action.target.kind !== 'file') return action;
            const destinationKey = await resolveCanonicalPath(
              action.target.dstAbs,
              physicalPaths,
            );
            const installedHash = action[INSTALLED_HASH];
            if (
              installedHash &&
              (await installed?.hasVerifiedOwner(
                target.name,
                action.relPath,
                destinationKey,
                installedHash,
              ))
            ) {
              sharedRetirements.push(action.relPath);
              return undefined;
            }
            if (action.sourceHash) {
              const entry = await statFile(destinationKey);
              if (entry && entry.nlink > 1n)
                linkedDestinations.set(destinationKey, `inode:${entry.dev}:${entry.ino}`);
            }
            return { ...action, destinationKey };
          }),
        );
        const actions = resolvedActions.filter((action) => action !== undefined);
        const unit = {
          ...base,
          namespaceRoots,
          sourceSnapshots,
          installedAssets: installed,
          sharedRetirements,
          plan: { ...plan, actions },
        };
        destinationsSeen.set(locationKey, unit);
        units.push(unit);
      } catch (error) {
        const failure = describePreparationFailure(error, target, 'error' in manifest);
        units.push({
          ...base,
          namespaceRoots,
          plan: { actions: [], requiresForce: false },
          error: failure.reason,
          failures: [{ unitKey: base.key, stage: 'prepare', ...failure }],
        });
      }
    }
  }
  return mergePlans(units, discoveryFailures, linkedDestinations, (path) =>
    resolveCanonicalPath(path, physicalPaths).catch(() => path),
  );
}
