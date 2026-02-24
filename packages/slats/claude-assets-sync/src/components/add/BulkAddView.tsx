import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React, { useEffect, useState } from 'react';

import { scanPackageAssets } from '@/claude-assets-sync/core/packageScanner.js';
import { syncPackage } from '@/claude-assets-sync/core/sync.js';
import { asyncPool } from '@/claude-assets-sync/utils/asyncPool.js';
import {
  filterByPattern,
  readProjectDependencies,
} from '@/claude-assets-sync/utils/dependencies.js';

import { StepRunner, type StepResult } from '../shared/StepRunner.js';
import { Table } from '../shared/Table.js';

export interface BulkAddViewProps {
  pattern: string;
  cwd: string;
  local?: boolean;
  ref?: string;
}

type Phase =
  | 'scanning-deps'
  | 'scanning-assets'
  | 'syncing'
  | 'done'
  | 'error';

interface PackageScanResult {
  name: string;
  status: 'synced' | 'skipped' | 'error';
  assetCount: number;
  error?: string;
}

/**
 * Bulk add view — scans dependencies by regex, scans assets, and syncs all found assets.
 */
export const BulkAddView: React.FC<BulkAddViewProps> = ({
  pattern,
  cwd,
  local = false,
  ref,
}) => {
  const [phase, setPhase] = useState<Phase>('scanning-deps');
  const [matches, setMatches] = useState<string[]>([]);
  const [scanSteps, setScanSteps] = useState<StepResult[]>([]);
  const [syncSteps, setSyncSteps] = useState<StepResult[]>([]);
  const [results, setResults] = useState<PackageScanResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      // ── Phase 1: scanning-deps ──────────────────────────────────────
      setPhase('scanning-deps');

      let matched: string[];
      try {
        const deps = readProjectDependencies(cwd);
        matched = filterByPattern(deps, pattern);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : String(err),
        );
        setPhase('error');
        return;
      }

      setMatches(matched);

      if (matched.length === 0) {
        // No matches — go straight to done with empty results
        setResults([]);
        setPhase('done');
        return;
      }

      // ── Phase 2: scanning-assets ────────────────────────────────────
      setPhase('scanning-assets');

      const initialScanSteps: StepResult[] = matched.map((name) => ({
        name,
        status: 'pending',
      }));
      setScanSteps(initialScanSteps);

      const packagesWithAssets: string[] = [];
      const scanResults: PackageScanResult[] = [];

      await asyncPool(3, matched, async (pkgName) => {
        // Mark running
        setScanSteps((prev) =>
          prev.map((s) =>
            s.name === pkgName ? { ...s, status: 'running' } : s,
          ),
        );

        try {
          const trees = await scanPackageAssets(pkgName, { local, ref, cwd });
          const hasAssets = trees.length > 0;

          if (hasAssets) {
            packagesWithAssets.push(pkgName);
            setScanSteps((prev) =>
              prev.map((s) =>
                s.name === pkgName
                  ? { ...s, status: 'success', output: `${trees.length} asset type(s)` }
                  : s,
              ),
            );
          } else {
            // Empty result = no claude assets configured → silent skip
            scanResults.push({ name: pkgName, status: 'skipped', assetCount: 0 });
            setScanSteps((prev) =>
              prev.map((s) =>
                s.name === pkgName ? { ...s, status: 'skipped' } : s,
              ),
            );
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);

          // Packages without claude asset config throw errors about missing assetPath /
          // asset path not existing — treat these as silent skips.
          const isNoAssets =
            /no repository|asset path.*does not exist|not found in/i.test(msg);

          if (isNoAssets) {
            scanResults.push({ name: pkgName, status: 'skipped', assetCount: 0 });
            setScanSteps((prev) =>
              prev.map((s) =>
                s.name === pkgName ? { ...s, status: 'skipped' } : s,
              ),
            );
          } else {
            // Real error (network, permission, parse failure, etc.)
            scanResults.push({ name: pkgName, status: 'error', assetCount: 0, error: msg });
            setScanSteps((prev) =>
              prev.map((s) =>
                s.name === pkgName
                  ? { ...s, status: 'failed', error: msg }
                  : s,
              ),
            );
          }
        }
      });

      if (packagesWithAssets.length === 0) {
        // Nothing to sync
        setResults(scanResults);
        setPhase('done');
        return;
      }

      // ── Phase 3: syncing ────────────────────────────────────────────
      setPhase('syncing');

      const initialSyncSteps: StepResult[] = packagesWithAssets.map((name) => ({
        name,
        status: 'pending',
      }));
      setSyncSteps(initialSyncSteps);

      await asyncPool(3, packagesWithAssets, async (pkgName) => {
        setSyncSteps((prev) =>
          prev.map((s) =>
            s.name === pkgName ? { ...s, status: 'running' } : s,
          ),
        );

        try {
          const result = await syncPackage(
            pkgName,
            {
              force: true,
              dryRun: false,
              local,
              ref,
              flat: true,
            },
            cwd,
            undefined, // no exclusions — bulk mode includes everything
            undefined, // outputDir
          );

          if (result.success && !result.skipped) {
            const assetCount = Object.values(result.syncedFiles ?? {}).reduce(
              (sum, files) => sum + files.length,
              0,
            );
            scanResults.push({ name: pkgName, status: 'synced', assetCount });
            setSyncSteps((prev) =>
              prev.map((s) =>
                s.name === pkgName
                  ? { ...s, status: 'success', output: `${assetCount} file(s)` }
                  : s,
              ),
            );
          } else if (result.skipped) {
            scanResults.push({ name: pkgName, status: 'skipped', assetCount: 0 });
            setSyncSteps((prev) =>
              prev.map((s) =>
                s.name === pkgName ? { ...s, status: 'skipped' } : s,
              ),
            );
          } else {
            const msg = result.reason ?? 'Sync failed';
            scanResults.push({ name: pkgName, status: 'error', assetCount: 0, error: msg });
            setSyncSteps((prev) =>
              prev.map((s) =>
                s.name === pkgName
                  ? { ...s, status: 'failed', error: msg }
                  : s,
              ),
            );
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          scanResults.push({ name: pkgName, status: 'error', assetCount: 0, error: msg });
          setSyncSteps((prev) =>
            prev.map((s) =>
              s.name === pkgName
                ? { ...s, status: 'failed', error: msg }
                : s,
            ),
          );
        }
      });

      setResults(scanResults);
      setPhase('done');
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ───────────────────────────────────────────────────────────

  if (phase === 'scanning-deps') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Scanning dependencies matching /{pattern}/...
        </Text>
      </Box>
    );
  }

  if (phase === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {errorMessage}</Text>
      </Box>
    );
  }

  if (phase === 'scanning-assets') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text>
            Found <Text bold>{matches.length}</Text> matching package(s). Scanning assets...
          </Text>
        </Box>
        <StepRunner
          steps={scanSteps}
          currentStep={scanSteps.findIndex((s) => s.status === 'running')}
          total={scanSteps.length}
        />
      </Box>
    );
  }

  if (phase === 'syncing') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text>Syncing packages...</Text>
        </Box>
        <StepRunner
          steps={syncSteps}
          currentStep={syncSteps.findIndex((s) => s.status === 'running')}
          total={syncSteps.length}
        />
      </Box>
    );
  }

  if (phase === 'done') {
    const synced = results.filter((r) => r.status === 'synced').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    if (results.length === 0) {
      return (
        <Box flexDirection="column">
          <Text color="yellow">
            No packages matched pattern /{pattern}/
          </Text>
        </Box>
      );
    }

    const rows = results.map((r) => {
      const statusCell =
        r.status === 'synced'
          ? '✓ synced'
          : r.status === 'skipped'
            ? '⏭ skipped'
            : `✗ error`;
      const assetsCell =
        r.status === 'synced' ? String(r.assetCount) : r.error ?? '-';
      return [r.name, statusCell, assetsCell];
    });

    return (
      <Box flexDirection="column">
        <Table
          headers={['Package', 'Status', 'Assets']}
          rows={rows}
        />
        <Box marginTop={1}>
          <Text>
            <Text color="green">{synced} synced</Text>
            <Text>, </Text>
            <Text color="blue">{skipped} skipped</Text>
            <Text>, </Text>
            <Text color={errors > 0 ? 'red' : 'gray'}>{errors} errors</Text>
          </Text>
        </Box>
      </Box>
    );
  }

  return null;
};
