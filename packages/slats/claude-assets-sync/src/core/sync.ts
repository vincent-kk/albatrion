import { logger } from '../utils/logger';
import { toFlatFileName } from '../utils/nameTransform';
import {
  buildAssetPath,
  buildVersionTag,
  findGitRoot,
  getAssetStructure,
  getAssetTypes,
  parseGitHubRepo,
  readLocalPackageJson,
  readPackageJson,
} from '../utils/package';
import { packageNameToPrefix } from '../utils/packageName';
import { getDestinationDir, getFlatDestinationDir } from '../utils/paths';
import type { CliOptions, FileMapping, SyncResult } from '../utils/types';
import {
  cleanAssetDir,
  cleanFlatAssetFiles,
  createSyncMeta,
  needsSync,
  writeAssetFile,
  writeFlatAssetFile,
  writeSyncMeta,
} from './filesystem';
import { RateLimitError, downloadAssetFiles, fetchAssetFiles } from './github';
import {
  createEmptyUnifiedMeta,
  needsSyncUnified,
  readUnifiedSyncMeta,
  updatePackageInMeta,
  writeUnifiedSyncMeta,
} from './syncMeta';

/**
 * Sync Claude assets for a single package
 * @param packageName - Package name to sync
 * @param options - CLI options
 * @param cwd - Current working directory
 * @param exclusions - Optional exclusions for selective syncing
 * @returns Sync result
 */
export const syncPackage = async (
  packageName: string,
  options: Pick<CliOptions, 'force' | 'dryRun' | 'local' | 'ref' | 'flat'>,
  cwd: string = process.cwd(),
  exclusions?: { directories: string[]; files: string[] },
  outputDir?: string,
): Promise<SyncResult> => {
  logger.packageStart(packageName);

  try {
    // Determine output directory (git root or provided outputDir)
    const destDir = outputDir ?? findGitRoot(cwd) ?? cwd;

    // Step 1: Read package.json from node_modules or local workspace
    const packageInfo = options.local
      ? readLocalPackageJson(packageName, cwd)
      : readPackageJson(packageName, cwd);
    if (!packageInfo) {
      const location = options.local ? 'workspace' : 'node_modules';
      return {
        packageName,
        success: false,
        skipped: true,
        reason: `Package not found in ${location}`,
      };
    }

    // Step 2: Check for claude config
    if (!packageInfo.claude?.assetPath)
      return {
        packageName,
        success: false,
        skipped: true,
        reason: 'Package does not have claude.assetPath in package.json',
      };

    // Step 3: Parse GitHub repository
    const repoInfo = parseGitHubRepo(packageInfo.repository);
    if (!repoInfo) {
      return {
        packageName,
        success: false,
        skipped: true,
        reason: 'Unable to parse GitHub repository URL',
      };
    }

    // Determine if using flat structure (default: true)
    const useFlat = options.flat !== false;

    if (useFlat) {
      // ============================================
      // FLAT MODE: Use unified metadata and flat naming
      // ============================================
      const prefix = packageNameToPrefix(packageName);
      const unifiedMeta =
        readUnifiedSyncMeta(destDir) ?? createEmptyUnifiedMeta();

      // Step 4: Check if sync is needed (unless force)
      if (
        !options.force &&
        !needsSyncUnified(unifiedMeta, prefix, packageInfo.version)
      ) {
        return {
          packageName,
          success: true,
          skipped: true,
          reason: `Already synced at version ${packageInfo.version}`,
        };
      }

      // Step 5: Build version tag (or use custom ref) and asset path
      const tag =
        options.ref ?? buildVersionTag(packageName, packageInfo.version);
      const assetPath = buildAssetPath(packageInfo.claude.assetPath);

      logger.step('Fetching', `asset list from GitHub (ref: ${tag})`);

      // Step 6: Get asset types from config and fetch asset file lists from GitHub
      const assetTypes = getAssetTypes(packageInfo.claude);
      const assetFiles = await fetchAssetFiles(
        repoInfo,
        assetPath,
        tag,
        assetTypes,
      );

      // Calculate total files across all asset types
      let totalFiles = 0;
      for (const assetType of assetTypes) {
        totalFiles += (assetFiles[assetType] || []).length;
      }

      // Check if any assets exist
      if (totalFiles === 0)
        return {
          packageName,
          success: false,
          skipped: true,
          reason: `No assets found in package (checked: ${assetTypes.join(', ')})`,
        };

      // Log found assets dynamically
      const foundSummary = assetTypes
        .map((type) => `${(assetFiles[type] || []).length} ${type}`)
        .join(', ');
      logger.step('Found', foundSummary);

      // Build file mappings dynamically based on structure
      const fileMappings: Record<string, string[] | FileMapping[]> = {};

      for (const assetType of assetTypes) {
        const entries = assetFiles[assetType] || [];
        if (entries.length === 0) continue;

        // Filter out excluded files
        const filteredEntries = entries.filter((entry) => {
          if (!exclusions) return true;

          const excludedPath = `${assetType}/${entry.name}`;
          return !exclusions.files.includes(excludedPath);
        });

        if (filteredEntries.length === 0) continue;

        const structure = getAssetStructure(assetType, packageInfo.claude);

        if (structure === 'nested') {
          // Nested structure: store original file names
          fileMappings[assetType] = filteredEntries.map((e) => e.name);
        } else {
          // Flat structure: store original → transformed mappings
          fileMappings[assetType] = filteredEntries.map((entry) => ({
            original: entry.name,
            transformed: toFlatFileName(prefix, entry.name),
          }));
        }
      }

      // Dry run mode - just log what would happen
      if (options.dryRun) {
        for (const assetType of assetTypes) {
          const mappings = fileMappings[assetType];
          if (!mappings || mappings.length === 0) continue;

          const structure = getAssetStructure(assetType, packageInfo.claude);

          if (structure === 'nested') {
            logger.step(
              `Would sync ${assetType} to`,
              getDestinationDir(destDir, packageName, assetType),
            );
            (mappings as string[]).forEach((fileName) => {
              logger.file('create', fileName);
            });
          } else {
            logger.step(
              `Would sync ${assetType} to`,
              getFlatDestinationDir(destDir, assetType),
            );
            (mappings as FileMapping[]).forEach((mapping) => {
              logger.file('create', mapping.transformed);
            });
          }
        }

        // Build syncedFiles for dry-run return
        const syncedFiles: Record<string, string[]> = {};
        for (const assetType of assetTypes) {
          const mappings = fileMappings[assetType];
          if (!mappings || mappings.length === 0) continue;

          if (typeof mappings[0] === 'string') {
            syncedFiles[assetType] = mappings as string[];
          } else {
            syncedFiles[assetType] = (mappings as FileMapping[]).map(
              (m) => m.transformed,
            );
          }
        }

        return {
          packageName,
          success: true,
          skipped: false,
          syncedFiles,
        };
      }

      // Step 7: Clean previous files for this package (based on structure)
      for (const assetType of assetTypes) {
        const structure = getAssetStructure(assetType, packageInfo.claude);

        if (structure === 'nested') {
          cleanAssetDir(destDir, packageName, assetType);
        } else {
          cleanFlatAssetFiles(destDir, assetType, prefix, unifiedMeta);
        }
      }

      // Step 8: Download and sync files with structure-based routing
      for (const assetType of assetTypes) {
        const entries = assetFiles[assetType] || [];
        if (entries.length === 0) continue;

        // Filter out excluded files
        const filteredEntries = entries.filter((entry) => {
          if (!exclusions) return true;

          // Check if this file is in exclusions
          const excludedPath = `${assetType}/${entry.name}`;
          return !exclusions.files.includes(excludedPath);
        });

        if (filteredEntries.length === 0) continue;

        const structure = getAssetStructure(assetType, packageInfo.claude);

        logger.step('Downloading', assetType);
        const downloadedFiles = await downloadAssetFiles(
          repoInfo,
          assetPath,
          assetType,
          filteredEntries,
          tag,
        );

        if (structure === 'nested') {
          // Nested structure: write to package-specific directory
          for (const [fileName, content] of downloadedFiles) {
            writeAssetFile(destDir, packageName, assetType, fileName, content);
            logger.file('create', fileName);
          }
        } else {
          // Flat structure: write with prefix to shared directory
          const mappings = fileMappings[assetType] as FileMapping[];
          for (const [fileName, content] of downloadedFiles) {
            const mapping = mappings.find((m) => m.original === fileName);
            const flatName =
              mapping?.transformed ?? toFlatFileName(prefix, fileName);
            writeFlatAssetFile(destDir, assetType, flatName, content);
            logger.file('create', flatName);
          }
        }
      }

      // Step 9: Update unified metadata
      const updatedMeta = updatePackageInMeta(unifiedMeta, prefix, {
        originalName: packageName,
        version: packageInfo.version,
        local: options.local,
        files: fileMappings,
        exclusions:
          exclusions &&
          (exclusions.directories.length > 0 || exclusions.files.length > 0)
            ? exclusions
            : undefined,
      });
      writeUnifiedSyncMeta(destDir, updatedMeta);

      // Build syncedFiles for return
      const syncedFiles: Record<string, string[]> = {};
      for (const assetType of assetTypes) {
        const mappings = fileMappings[assetType];
        if (!mappings || mappings.length === 0) continue;

        if (typeof mappings[0] === 'string') {
          syncedFiles[assetType] = mappings as string[];
        } else {
          syncedFiles[assetType] = (mappings as FileMapping[]).map(
            (m) => m.transformed,
          );
        }
      }

      return {
        packageName,
        success: true,
        skipped: false,
        syncedFiles,
      };
    } else {
      // ============================================
      // LEGACY MODE: Nested structure with per-package metadata
      // ============================================

      // Step 5: Build version tag (or use custom ref) and asset path
      const tag =
        options.ref ?? buildVersionTag(packageName, packageInfo.version);
      const assetPath = buildAssetPath(packageInfo.claude.assetPath);

      logger.step('Fetching', `asset list from GitHub (ref: ${tag})`);

      // Step 6: Get asset types from config and fetch asset file lists from GitHub
      const assetTypes = getAssetTypes(packageInfo.claude);
      const assetFiles = await fetchAssetFiles(
        repoInfo,
        assetPath,
        tag,
        assetTypes,
      );

      // Calculate total files across all asset types
      let totalFiles = 0;
      for (const assetType of assetTypes) {
        totalFiles += (assetFiles[assetType] || []).length;
      }

      // Check if any assets exist
      if (totalFiles === 0)
        return {
          packageName,
          success: false,
          skipped: true,
          reason: `No assets found in package (checked: ${assetTypes.join(', ')})`,
        };

      // Log found assets dynamically
      const foundSummary = assetTypes
        .map((type) => `${(assetFiles[type] || []).length} ${type}`)
        .join(', ');
      logger.step('Found', foundSummary);

      // Step 4: Check if sync is needed (unless force)
      if (
        !options.force &&
        !needsSync(destDir, packageName, packageInfo.version, assetTypes)
      ) {
        return {
          packageName,
          success: true,
          skipped: true,
          reason: `Already synced at version ${packageInfo.version}`,
        };
      }

      // Dry run mode - just log what would happen
      if (options.dryRun) {
        const syncedFiles: Record<string, string[]> = {};

        for (const assetType of assetTypes) {
          const entries = assetFiles[assetType] || [];
          if (entries.length === 0) continue;

          // Filter out excluded files
          const filteredEntries = entries.filter((entry) => {
            if (!exclusions) return true;

            const excludedPath = `${assetType}/${entry.name}`;
            return !exclusions.files.includes(excludedPath);
          });

          if (filteredEntries.length === 0) continue;

          logger.step(
            `Would sync ${assetType} to`,
            getDestinationDir(destDir, packageName, assetType),
          );
          filteredEntries.forEach((entry) => logger.file('create', entry.name));
          syncedFiles[assetType] = filteredEntries.map((e) => e.name);
        }

        return {
          packageName,
          success: true,
          skipped: false,
          syncedFiles,
        };
      }

      // Step 7: Download and sync files dynamically
      const syncedFiles: Record<string, string[]> = {};

      for (const assetType of assetTypes) {
        const entries = assetFiles[assetType] || [];
        if (entries.length === 0) continue;

        // Filter out excluded files
        const filteredEntries = entries.filter((entry) => {
          if (!exclusions) return true;

          const excludedPath = `${assetType}/${entry.name}`;
          return !exclusions.files.includes(excludedPath);
        });

        if (filteredEntries.length === 0) continue;

        logger.step('Downloading', assetType);
        const downloadedFiles = await downloadAssetFiles(
          repoInfo,
          assetPath,
          assetType,
          filteredEntries,
          tag,
        );

        // Clean existing directory and write new files
        cleanAssetDir(destDir, packageName, assetType);
        syncedFiles[assetType] = [];

        for (const [fileName, content] of downloadedFiles) {
          writeAssetFile(destDir, packageName, assetType, fileName, content);
          logger.file('create', fileName);
          syncedFiles[assetType].push(fileName);
        }

        // Write sync meta for this asset type
        writeSyncMeta(
          destDir,
          packageName,
          assetType,
          createSyncMeta(packageInfo.version, syncedFiles[assetType]),
        );
      }

      return {
        packageName,
        success: true,
        skipped: false,
        syncedFiles,
      };
    }
  } catch (error) {
    if (error instanceof RateLimitError)
      return {
        packageName,
        success: false,
        skipped: false,
        reason: error.message,
      };

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      packageName,
      success: false,
      skipped: false,
      reason: message,
    };
  }
};

/**
 * Sync Claude assets for multiple packages
 * @param packages - List of package names to sync
 * @param options - CLI options
 * @param cwd - Current working directory
 * @returns Array of sync results
 */
export const syncPackages = async (
  packages: string[],
  options: Pick<CliOptions, 'force' | 'dryRun' | 'local' | 'ref' | 'flat'>,
  cwd: string = process.cwd(),
): Promise<SyncResult[]> => {
  const results: SyncResult[] = [];

  // Find git root once for all packages
  const gitRoot = findGitRoot(cwd);
  if (gitRoot) logger.info(`[Output] ${gitRoot}/.claude\n`);

  for (const packageName of packages) {
    const result = await syncPackage(
      packageName,
      options,
      cwd,
      undefined, // exclusions (not supported in batch sync)
      gitRoot ?? undefined,
    );
    logger.packageEnd(packageName, result);
    results.push(result);
  }

  // Print summary
  const summary = {
    success: results.filter((r) => r.success && !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    failed: results.filter((r) => !r.success && !r.skipped).length,
  };
  logger.summary(summary);

  return results;
};
