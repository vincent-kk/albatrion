import { Box, Text, useApp, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  applyChangesAndSync,
  computeFileOperations,
} from '@/claude-assets-sync/core/listOperations.js';
import type { PackageFiles } from '@/claude-assets-sync/core/listOperations.js';
import { scanPackageAssets } from '@/claude-assets-sync/core/packageScanner.js';
import { syncPackage } from '@/claude-assets-sync/core/sync.js';
import { readUnifiedSyncMeta } from '@/claude-assets-sync/core/syncMeta.js';
import { updatePackageVersionAndSync } from '@/claude-assets-sync/commands/update.js';
import {
  readLocalPackageJson,
  readPackageJson,
} from '@/claude-assets-sync/utils/package.js';
import type {
  PackageSyncInfo,
  SkillUnit,
  TreeNode,
  UnifiedSyncMeta,
} from '@/claude-assets-sync/utils/types.js';
import { Confirm, MenuItem, Table } from '../shared/index.js';
import type { StepResult } from '../shared/index.js';
import { StepRunner } from '../shared/index.js';
import { TreeSelect } from '../tree/index.js';
import type { ListPhase, PackageDetailInfo, SelectItem } from './types.js';

export interface ListCommandProps {
  cwd: string;
}

// ── Helper: build PackageDetailInfo from meta ──

function buildPackageDetail(
  prefix: string,
  info: PackageSyncInfo,
  syncedAt?: string,
): PackageDetailInfo {
  let totalAssets = 0;
  for (const files of Object.values(info.files)) {
    totalAssets += Array.isArray(files) ? files.length : 0;
  }

  return {
    prefix,
    originalName: info.originalName,
    version: info.version,
    local: info.local ?? false,
    syncedAt,
    files: info.files,
    totalAssets,
  };
}

// ── Helper: format sync date ──

function formatSyncDate(dateStr?: string): string {
  if (!dateStr) return 'unknown';
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

// ── Main ListCommand ──

export const ListCommand: React.FC<ListCommandProps> = ({ cwd }) => {
  const { exit } = useApp();
  const [phase, setPhase] = useState<ListPhase>('loading');
  const [meta, setMeta] = useState<UnifiedSyncMeta | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] =
    useState<PackageDetailInfo | null>(null);

  // Sync action state
  const [syncSteps, setSyncSteps] = useState<StepResult[]>([]);

  // Edit-assets state
  const [packageFiles, setPackageFiles] = useState<PackageFiles>({});
  const [editTrees, setEditTrees] = useState<TreeNode[]>([]);

  // Update-action state
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateResult, setUpdateResult] = useState<{
    versionChanged: boolean;
    oldVersion?: string;
    newVersion?: string;
    notFound?: boolean;
  } | null>(null);
  const [updateConfirmPending, setUpdateConfirmPending] = useState(false);
  const [updateSyncSteps, setUpdateSyncSteps] = useState<StepResult[]>([]);
  const [updateSyncing, setUpdateSyncing] = useState(false);

  // Status view state
  const [checkingRemote, setCheckingRemote] = useState(false);
  const [remoteVersions, setRemoteVersions] = useState<
    Record<string, string> | null
  >(null);

  const hasLoadedRef = useRef(false);

  // ── ESC navigation ──

  useInput((_input, key) => {
    if (!key.escape) return;
    switch (phase) {
      case 'main-menu':
        exit();
        break;
      case 'package-list':
        setPhase('main-menu');
        break;
      case 'package-detail':
        setSelectedPackage(null);
        setPhase('package-list');
        break;
      case 'edit-assets':
        setPhase('package-detail');
        break;
      case 'status-view':
        setRemoteVersions(null);
        setCheckingRemote(false);
        setPhase('main-menu');
        break;
      case 'error':
        exit();
        break;
      // action phases (sync-action, remove-action, update-action, confirming): no-op
    }
  });

  // ── Auto-exit on done phase ──

  useEffect(() => {
    if (phase !== 'done') return;
    const timer = setTimeout(() => exit(), 1500);
    return () => clearTimeout(timer);
  }, [phase, exit]);

  // ── Load meta ──

  const loadMeta = useCallback(() => {
    try {
      const loaded = readUnifiedSyncMeta(cwd);
      setMeta(loaded);
      return loaded;
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load sync metadata',
      );
      setPhase('error');
      return null;
    }
  }, [cwd]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const loaded = loadMeta();
      if (loaded && Object.keys(loaded.packages).length > 0) {
        setPhase('main-menu');
      } else if (loaded) {
        // No packages synced
        setPhase('done');
      }
    }
  }, [loadMeta]);

  // ── Reload meta after mutations ──

  const reloadMeta = useCallback(() => {
    const loaded = loadMeta();
    if (loaded && selectedPackage) {
      const pkgInfo = loaded.packages[selectedPackage.prefix];
      if (pkgInfo) {
        setSelectedPackage(
          buildPackageDetail(selectedPackage.prefix, pkgInfo, loaded.syncedAt),
        );
      } else {
        // Package was removed
        setSelectedPackage(null);
      }
    }
    return loaded;
  }, [loadMeta, selectedPackage]);

  // ── Handlers ──

  const handleMainMenuSelect = (item: SelectItem) => {
    switch (item.value) {
      case 'packages':
        setPhase('package-list');
        break;
      case 'status':
        setRemoteVersions(null);
        setCheckingRemote(false);
        setPhase('status-view');
        break;
      case 'exit':
        exit();
        break;
    }
  };

  const handlePackageSelect = (item: SelectItem) => {
    if (item.value === 'back') {
      setPhase('main-menu');
      return;
    }

    if (!meta) return;
    const prefix = item.value;
    const pkgInfo = meta.packages[prefix];
    if (pkgInfo) {
      setSelectedPackage(
        buildPackageDetail(prefix, pkgInfo, meta.syncedAt),
      );
      setPhase('package-detail');
    }
  };

  const handleDetailActionSelect = (item: SelectItem) => {
    switch (item.value) {
      case 'sync':
        setPhase('sync-action');
        handleSyncAction();
        break;
      case 'update':
        setUpdateResult(null);
        setUpdateConfirmPending(false);
        setUpdateSyncing(false);
        setUpdateSyncSteps([]);
        setPhase('update-action');
        handleUpdateActionCheck();
        break;
      case 'edit-assets':
        handleEditAssetsInit();
        break;
      case 'remove':
        setPhase('remove-action');
        break;
      case 'back':
        setSelectedPackage(null);
        setPhase('package-list');
        break;
    }
  };

  // ── Sync action ──

  const handleSyncAction = async () => {
    if (!selectedPackage || !meta) return;

    const pkgInfo = meta.packages[selectedPackage.prefix];
    if (!pkgInfo) return;

    setSyncSteps([
      { name: `Syncing ${selectedPackage.originalName}`, status: 'running' },
    ]);

    try {
      await syncPackage(
        selectedPackage.originalName,
        {
          force: true,
          dryRun: false,
          local: pkgInfo.local ?? false,
          ref: undefined,
          flat: undefined,
        },
        cwd,
        pkgInfo.exclusions,
      );

      setSyncSteps([
        { name: `Syncing ${selectedPackage.originalName}`, status: 'success' },
      ]);
    } catch (err) {
      setSyncSteps([
        {
          name: `Syncing ${selectedPackage.originalName}`,
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        },
      ]);
    }

    // Reload and go back to detail after a brief pause
    setTimeout(() => {
      reloadMeta();
      setPhase('package-detail');
    }, 1000);
  };

  // ── Update action ──

  const handleUpdateActionCheck = async () => {
    if (!selectedPackage || !meta) return;

    setUpdateChecking(true);
    const pkgInfo = meta.packages[selectedPackage.prefix];
    if (!pkgInfo) return;

    const isLocal = pkgInfo.local ?? false;
    try {
      const currentPkgInfo = isLocal
        ? readLocalPackageJson(pkgInfo.originalName, cwd)
        : readPackageJson(pkgInfo.originalName, cwd);

      if (!currentPkgInfo) {
        setUpdateResult({ versionChanged: false, notFound: true });
        setUpdateChecking(false);
        setTimeout(() => {
          reloadMeta();
          setPhase('package-detail');
        }, 2000);
        return;
      }

      const installedVersion = currentPkgInfo.version;
      const syncedVersion = pkgInfo.version;

      if (installedVersion === syncedVersion) {
        setUpdateResult({
          versionChanged: false,
          oldVersion: syncedVersion,
          newVersion: installedVersion,
        });
        setUpdateChecking(false);
        setTimeout(() => {
          reloadMeta();
          setPhase('package-detail');
        }, 1500);
      } else {
        setUpdateResult({
          versionChanged: true,
          oldVersion: syncedVersion,
          newVersion: installedVersion,
        });
        setUpdateChecking(false);
        setUpdateConfirmPending(true);
      }
    } catch {
      setUpdateResult({ versionChanged: false, notFound: true });
      setUpdateChecking(false);
      setTimeout(() => {
        reloadMeta();
        setPhase('package-detail');
      }, 2000);
    }
  };

  const handleUpdateConfirm = async (yes: boolean) => {
    setUpdateConfirmPending(false);
    if (!yes) {
      reloadMeta();
      setPhase('package-detail');
      return;
    }

    if (!selectedPackage || !meta) return;

    setUpdateSyncing(true);
    setUpdateSyncSteps([
      { name: 'Updating version and syncing files...', status: 'running' },
    ]);

    try {
      await updatePackageVersionAndSync(
        selectedPackage.prefix,
        meta,
        { local: meta.packages[selectedPackage.prefix]?.local, sync: true },
        cwd,
      );
      setUpdateSyncSteps([
        { name: 'Version updated and files synced', status: 'success' },
      ]);
    } catch (err) {
      setUpdateSyncSteps([
        {
          name: 'Update version',
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        },
      ]);
    }

    setTimeout(() => {
      reloadMeta();
      setPhase('package-detail');
    }, 1000);
  };

  // ── Remove action ──

  const handleRemoveConfirm = async (yes: boolean) => {
    if (!yes) {
      setPhase('package-detail');
      return;
    }

    if (!selectedPackage || !meta) return;

    const pkgInfo = meta.packages[selectedPackage.prefix];
    if (!pkgInfo) return;

    try {
      // Build a ChangesSummary that removes the entire package
      const filesToDelete: string[] = [];
      const fileOperations: Array<{
        type: 'remove';
        prefix: string;
        assetType: string;
        skillName: string;
      }> = [];

      for (const [assetType, files] of Object.entries(pkgInfo.files)) {
        if (!Array.isArray(files)) continue;
        const units = files as SkillUnit[];
        for (const unit of units) {
          fileOperations.push({
            type: 'remove',
            prefix: selectedPackage.prefix,
            assetType,
            skillName: unit.name,
          });
        }
      }

      await applyChangesAndSync(
        { filesToDelete, fileOperations, packagesToSync: [] },
        meta,
        cwd,
      );

      const reloaded = reloadMeta();
      if (
        reloaded &&
        Object.keys(reloaded.packages).length > 0
      ) {
        setSelectedPackage(null);
        setPhase('package-list');
      } else {
        setPhase('done');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to remove package',
      );
      setPhase('error');
    }
  };

  // ── Edit-assets init ──

  const handleEditAssetsInit = async () => {
    if (!selectedPackage || !meta) return;

    setPhase('edit-assets');

    const pkgInfo = meta.packages[selectedPackage.prefix];
    if (!pkgInfo) return;

    const prefix = selectedPackage.prefix;

    try {
      const isLocal = pkgInfo.local ?? true;
      let scannedTrees = await scanPackageAssets(pkgInfo.originalName, {
        local: isLocal,
        ref: undefined,
      }).catch(() => null);

      if (!scannedTrees && pkgInfo.local === undefined) {
        scannedTrees = await scanPackageAssets(pkgInfo.originalName, {
          local: !isLocal,
          ref: undefined,
        }).catch(() => null);
      }

      let available: TreeNode[];

      if (scannedTrees) {
        available = scannedTrees;
      } else {
        // Fallback: build tree from synced files
        available = buildFallbackTrees(prefix, pkgInfo);
      }

      // Build selected set from meta
      const excludedFiles = new Set(pkgInfo.exclusions?.files || []);
      const metaSelectedFiles = new Set(
        Object.entries(pkgInfo.files).flatMap(([assetType, files]) =>
          (Array.isArray(files) ? (files as SkillUnit[]) : [])
            .map((unit) => {
              const filePath = `${assetType}/${unit.name}`;
              if (
                excludedFiles.has(filePath) ||
                excludedFiles.has(unit.name)
              ) {
                return null;
              }
              return filePath;
            })
            .filter((f): f is string => f !== null),
        ),
      );

      const newPackageFiles: PackageFiles = {
        [prefix]: { available, selected: metaSelectedFiles },
      };
      setPackageFiles(newPackageFiles);

      // Build tree for TreeSelect
      const trees = buildEditTrees(prefix, pkgInfo, available, metaSelectedFiles);
      setEditTrees(trees);
    } catch {
      // If loading fails, go back to detail
      setPhase('package-detail');
    }
  };

  const handleEditAssetsSubmit = async (selectedTrees: TreeNode[]) => {
    if (!meta || !selectedPackage) return;

    const summary = computeFileOperations(
      meta,
      packageFiles,
      selectedTrees,
      cwd,
    );

    if (
      summary.filesToDelete.length === 0 &&
      summary.packagesToSync.length === 0 &&
      summary.fileOperations.length === 0
    ) {
      // No changes
      setPhase('package-detail');
      return;
    }

    setPhase('sync-action');
    setSyncSteps([{ name: 'Applying changes...', status: 'running' }]);

    try {
      await applyChangesAndSync(summary, meta, cwd, {
        onSyncStart: () => {
          setSyncSteps([{ name: 'Syncing files...', status: 'running' }]);
        },
      });

      setSyncSteps([{ name: 'Changes applied', status: 'success' }]);
    } catch (err) {
      setSyncSteps([
        {
          name: 'Apply changes',
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        },
      ]);
    }

    setTimeout(() => {
      reloadMeta();
      setPhase('package-detail');
    }, 1000);
  };

  const handleEditAssetsCancel = () => {
    setPhase('package-detail');
  };

  // ── Status view handlers ──

  const handleStatusMenuSelect = (item: SelectItem) => {
    if (item.value === 'check-remote') {
      handleCheckRemoteVersions();
    } else if (item.value === 'back') {
      setRemoteVersions(null);
      setCheckingRemote(false);
      setPhase('main-menu');
    }
  };

  const handleCheckRemoteVersions = async () => {
    if (!meta) return;
    setCheckingRemote(true);

    try {
      const versions: Record<string, string> = {};

      for (const [, pkgInfo] of Object.entries(meta.packages)) {
        try {
          const res = await fetch(
            `https://registry.npmjs.org/${pkgInfo.originalName}/latest`,
          );
          if (res.ok) {
            const data = (await res.json()) as { version: string };
            versions[pkgInfo.originalName] = data.version;
          }
        } catch {
          // skip failed lookups
        }
      }

      setRemoteVersions(versions);
    } catch {
      // ignore
    } finally {
      setCheckingRemote(false);
    }
  };

  // ── Render: loading ──

  if (phase === 'loading') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Loading synced packages...
        </Text>
      </Box>
    );
  }

  // ── Render: error ──

  if (phase === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {errorMessage ?? 'Unknown error'}</Text>
        <Box marginTop={1}>
          <Text dimColor>
            Press <Text bold>ESC</Text> to exit
          </Text>
        </Box>
      </Box>
    );
  }

  // ── Render: done ──

  if (phase === 'done') {
    if (!meta || Object.keys(meta.packages).length === 0) {
      return (
        <Box flexDirection="column">
          <Text color="yellow">No packages synced yet.</Text>
          <Text dimColor>Exiting...</Text>
        </Box>
      );
    }
    return null;
  }

  // ── Render: main-menu ──

  if (phase === 'main-menu' && meta) {
    const packageCount = Object.keys(meta.packages).length;
    const menuItems: SelectItem[] = [
      { label: `Packages (${packageCount})`, value: 'packages' },
      { label: 'Status', value: 'status' },
      { label: 'Exit', value: 'exit' },
    ];

    return (
      <Box flexDirection="column">
        <SelectInput
          items={menuItems}
          onSelect={handleMainMenuSelect}
          itemComponent={MenuItem}
        />
        <Box marginTop={1}>
          <Text dimColor>
            Press <Text bold>ESC</Text> to exit
          </Text>
        </Box>
      </Box>
    );
  }

  // ── Render: package-list ──

  if (phase === 'package-list' && meta) {
    const items: SelectItem[] = Object.entries(meta.packages).map(
      ([prefix, pkgInfo]) => {
        let totalAssets = 0;
        for (const files of Object.values(pkgInfo.files)) {
          totalAssets += Array.isArray(files) ? files.length : 0;
        }

        const syncDate = formatSyncDate(meta.syncedAt);
        return {
          label: `${pkgInfo.originalName}@${pkgInfo.version}  \u2022  ${totalAssets} assets  \u2022  ${syncDate}`,
          value: prefix,
        };
      },
    );

    items.push({ label: '\u2190 Back', value: 'back' });

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Synced Packages</Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={handlePackageSelect}
          itemComponent={MenuItem}
        />
        <Box marginTop={1}>
          <Text dimColor>
            Press <Text bold>ESC</Text> to go back
          </Text>
        </Box>
      </Box>
    );
  }

  // ── Render: package-detail ──

  if (phase === 'package-detail' && selectedPackage && meta) {
    const assetEntries = Object.entries(selectedPackage.files);

    const actionItems: SelectItem[] = [
      { label: 'Sync', value: 'sync' },
      { label: 'Update Version', value: 'update' },
      { label: 'Edit Assets', value: 'edit-assets' },
      { label: 'Remove', value: 'remove' },
      { label: '\u2190 Back', value: 'back' },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>
            {selectedPackage.originalName}@{selectedPackage.version}
          </Text>
        </Box>

        <Box flexDirection="column" marginLeft={2} marginBottom={1}>
          <Text>
            <Text dimColor>Source: </Text>
            <Text>{selectedPackage.local ? 'local' : 'remote'}</Text>
          </Text>
          <Text>
            <Text dimColor>Synced: </Text>
            <Text>{formatSyncDate(selectedPackage.syncedAt)}</Text>
          </Text>
          <Text>
            <Text dimColor>Total:  </Text>
            <Text>{selectedPackage.totalAssets} assets</Text>
          </Text>

          {assetEntries.map(([assetType, files]) => {
            const count = Array.isArray(files) ? files.length : 0;
            return (
              <Text key={assetType}>
                <Text dimColor>  {assetType}: </Text>
                <Text>{count} files</Text>
              </Text>
            );
          })}
        </Box>

        <SelectInput
          items={actionItems}
          onSelect={handleDetailActionSelect}
          itemComponent={MenuItem}
        />
        <Box marginTop={1}>
          <Text dimColor>
            Press <Text bold>ESC</Text> to go back
          </Text>
        </Box>
      </Box>
    );
  }

  // ── Render: sync-action ──

  if (phase === 'sync-action') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Syncing Package</Text>
        </Box>
        <StepRunner steps={syncSteps} currentStep={0} total={syncSteps.length} />
      </Box>
    );
  }

  // ── Render: remove-action ──

  if (phase === 'remove-action' && selectedPackage) {
    return (
      <Box flexDirection="column">
        <Confirm
          message={`Remove ${selectedPackage.originalName}? This will delete all synced files.`}
          onConfirm={handleRemoveConfirm}
          defaultYes={false}
        />
      </Box>
    );
  }

  // ── Render: update-action ──

  if (phase === 'update-action') {
    if (updateChecking) {
      return (
        <Box>
          <Text color="cyan">
            <Spinner type="dots" /> Checking installed version...
          </Text>
        </Box>
      );
    }

    if (updateSyncing) {
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold>Updating Package</Text>
          </Box>
          <StepRunner
            steps={updateSyncSteps}
            currentStep={0}
            total={updateSyncSteps.length}
          />
        </Box>
      );
    }

    if (updateConfirmPending && updateResult) {
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text>
              <Text dimColor>Current sync: </Text>
              <Text color="yellow">{updateResult.oldVersion}</Text>
              <Text dimColor> → Installed: </Text>
              <Text color="green">{updateResult.newVersion}</Text>
            </Text>
          </Box>
          <Confirm
            message="Update version and re-sync?"
            onConfirm={handleUpdateConfirm}
            defaultYes={true}
          />
        </Box>
      );
    }

    if (updateResult && !updateResult.versionChanged) {
      if (updateResult.notFound) {
        return (
          <Box>
            <Text color="yellow">
              Package not found in node_modules or workspace
            </Text>
          </Box>
        );
      }
      return (
        <Box>
          <Text color="green">
            Already up to date (version {updateResult.oldVersion})
          </Text>
        </Box>
      );
    }

    return null;
  }

  // ── Render: edit-assets ──

  if (phase === 'edit-assets') {
    if (editTrees.length === 0) {
      return (
        <Box>
          <Text color="cyan">
            <Spinner type="dots" /> Loading available assets...
          </Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Edit Assets</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>
            Space: toggle | Enter: save | Esc: cancel
          </Text>
        </Box>
        <TreeSelect
          trees={editTrees}
          onSubmit={handleEditAssetsSubmit}
          onCancel={handleEditAssetsCancel}
        />
      </Box>
    );
  }

  // ── Render: status-view ──

  if (phase === 'status-view' && meta) {
    const packageEntries = Object.entries(meta.packages);

    const statusRows = packageEntries.map(([, pkgInfo]) => {
      let totalAssets = 0;
      for (const files of Object.values(pkgInfo.files)) {
        totalAssets += Array.isArray(files) ? files.length : 0;
      }

      const remoteVer = remoteVersions?.[pkgInfo.originalName] ?? '-';
      return [
        pkgInfo.originalName,
        pkgInfo.version,
        remoteVer,
        String(totalAssets),
        formatSyncDate(meta.syncedAt),
      ];
    });

    const statusMenuItems: SelectItem[] = [
      { label: 'Check Remote Versions', value: 'check-remote' },
      { label: '\u2190 Back', value: 'back' },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Sync Status</Text>
        </Box>

        <Table
          headers={['Package', 'Local', 'Remote', 'Assets', 'Synced']}
          rows={statusRows}
        />

        {checkingRemote && (
          <Box marginTop={1}>
            <Text color="cyan">
              <Spinner type="dots" /> Checking remote versions...
            </Text>
          </Box>
        )}

        <Box marginTop={1}>
          <SelectInput
            items={statusMenuItems}
            onSelect={handleStatusMenuSelect}
            itemComponent={MenuItem}
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>
            Press <Text bold>ESC</Text> to go back
          </Text>
        </Box>
      </Box>
    );
  }

  return null;
};

// ── Helper: build fallback trees from synced files ──

function buildFallbackTrees(
  prefix: string,
  packageInfo: PackageSyncInfo,
): TreeNode[] {
  const assetTypeTrees: TreeNode[] = [];

  for (const [assetType, files] of Object.entries(packageInfo.files)) {
    const units = Array.isArray(files) ? (files as SkillUnit[]) : [];
    if (units.length === 0) continue;

    const skillNodes: TreeNode[] = units.map((unit) => {
      const displayName = unit.transformed ?? unit.name;

      if (unit.isDirectory) {
        return {
          id: `${prefix}/${assetType}/${displayName}`,
          label: displayName,
          path: `${assetType}/${unit.name}`,
          type: 'skill-directory' as const,
          viewOnly: true,
          selected: true,
          expanded: false,
          children: (unit.internalFiles || []).map((f) => ({
            id: `${prefix}/${assetType}/${displayName}/${f}`,
            label: f,
            path: `${assetType}/${unit.name}/${f}`,
            type: 'file' as const,
            selected: true,
            expanded: false,
            disabled: true,
          })),
        };
      }

      return {
        id: `${prefix}/${assetType}/${displayName}`,
        label: displayName,
        path: `${assetType}/${unit.name}`,
        type: 'file' as const,
        selected: true,
        expanded: false,
      };
    });

    assetTypeTrees.push({
      id: `${prefix}/${assetType}`,
      label: assetType,
      path: assetType,
      type: 'directory' as const,
      children: skillNodes,
      selected: true,
      expanded: true,
    });
  }

  return assetTypeTrees;
}

// ── Helper: build edit trees with selection state ──

function buildEditTrees(
  prefix: string,
  packageInfo: PackageSyncInfo,
  available: TreeNode[],
  selectedFiles: Set<string>,
): TreeNode[] {
  const assetTypeTrees = available.map((assetTypeTree) => {
    const clonedTree = { ...assetTypeTree };

    if (clonedTree.children) {
      clonedTree.children = clonedTree.children.map((fileNode) => {
        const selected = selectedFiles.has(fileNode.path);
        return { ...fileNode, selected };
      });

      const anySelected = clonedTree.children.some((f) => f.selected);
      clonedTree.selected = anySelected;
    }

    return clonedTree;
  });

  return [
    {
      id: prefix,
      label: `${packageInfo.originalName}@${packageInfo.version}`,
      path: packageInfo.originalName,
      type: 'directory' as const,
      children: assetTypeTrees,
      selected: true,
      expanded: true,
    },
  ];
}
