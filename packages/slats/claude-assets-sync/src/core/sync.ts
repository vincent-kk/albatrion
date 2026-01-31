import { logger } from '../utils/logger';
import {
  buildAssetPath,
  buildVersionTag,
  findGitRoot,
  parseGitHubRepo,
  readLocalPackageJson,
  readPackageJson,
} from '../utils/package';
import type { CliOptions, SyncResult } from '../utils/types';
import {
  cleanAssetDir,
  createSyncMeta,
  getDestinationDir,
  needsSync,
  writeAssetFile,
  writeSyncMeta,
} from './filesystem';
import { RateLimitError, downloadAssetFiles, fetchAssetFiles } from './github';

/**
 * Sync Claude assets for a single package
 * @param packageName - Package name to sync
 * @param options - CLI options
 * @param cwd - Current working directory
 * @returns Sync result
 */
export const syncPackage = async (
  packageName: string,
  options: Pick<CliOptions, 'force' | 'dryRun' | 'local' | 'ref'>,
  cwd: string = process.cwd(),
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

    // Step 4: Check if sync is needed (unless force)
    if (
      !options.force &&
      !needsSync(destDir, packageName, packageInfo.version)
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

    // Step 6: Fetch asset file lists from GitHub
    const { commands, skills } = await fetchAssetFiles(
      repoInfo,
      assetPath,
      tag,
    );

    // Check if any assets exist
    if (commands.length === 0 && skills.length === 0)
      return {
        packageName,
        success: false,
        skipped: true,
        reason: 'No commands or skills found in package',
      };

    logger.step(
      'Found',
      `${commands.length} commands, ${skills.length} skills`,
    );

    // Dry run mode - just log what would happen
    if (options.dryRun) {
      if (commands.length > 0) {
        logger.step(
          'Would sync commands to',
          getDestinationDir(destDir, packageName, 'commands'),
        );
        commands.forEach((entry) => logger.file('create', entry.name));
      }
      if (skills.length > 0) {
        logger.step(
          'Would sync skills to',
          getDestinationDir(destDir, packageName, 'skills'),
        );
        skills.forEach((entry) => logger.file('create', entry.name));
      }

      return {
        packageName,
        success: true,
        skipped: false,
        syncedFiles: {
          commands: commands.map((e) => e.name),
          skills: skills.map((e) => e.name),
        },
      };
    }

    // Step 7: Download and sync files
    const syncedFiles: { commands: string[]; skills: string[] } = {
      commands: [],
      skills: [],
    };

    // Sync commands
    if (commands.length > 0) {
      logger.step('Downloading', 'commands');
      const commandFiles = await downloadAssetFiles(
        repoInfo,
        assetPath,
        'commands',
        commands,
        tag,
      );

      // Clean existing directory and write new files
      cleanAssetDir(destDir, packageName, 'commands');
      for (const [fileName, content] of commandFiles) {
        writeAssetFile(destDir, packageName, 'commands', fileName, content);
        logger.file('create', fileName);
        syncedFiles.commands.push(fileName);
      }

      // Write sync meta
      writeSyncMeta(
        destDir,
        packageName,
        'commands',
        createSyncMeta(packageInfo.version, syncedFiles.commands),
      );
    }

    // Sync skills
    if (skills.length > 0) {
      logger.step('Downloading', 'skills');
      const skillFiles = await downloadAssetFiles(
        repoInfo,
        assetPath,
        'skills',
        skills,
        tag,
      );

      // Clean existing directory and write new files
      cleanAssetDir(destDir, packageName, 'skills');
      for (const [fileName, content] of skillFiles) {
        writeAssetFile(destDir, packageName, 'skills', fileName, content);
        logger.file('create', fileName);
        syncedFiles.skills.push(fileName);
      }

      // Write sync meta
      writeSyncMeta(
        destDir,
        packageName,
        'skills',
        createSyncMeta(packageInfo.version, syncedFiles.skills),
      );
    }

    return {
      packageName,
      success: true,
      skipped: false,
      syncedFiles,
    };
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
  options: Pick<CliOptions, 'force' | 'dryRun' | 'local' | 'ref'>,
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
