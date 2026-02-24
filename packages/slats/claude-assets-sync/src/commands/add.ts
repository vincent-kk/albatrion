import { render } from 'ink';
import React from 'react';

import { AddCommand } from '@/claude-assets-sync/components/add/index.js';
import { BulkAddView } from '@/claude-assets-sync/components/add/BulkAddView.js';
import { syncPackage } from '@/claude-assets-sync/core/sync.js';
import type { AddCommandOptions } from '@/claude-assets-sync/commands/types.js';
import type { AddCommandSelection } from '@/claude-assets-sync/utils/types.js';

/**
 * Run the add command with interactive asset selection or bulk pattern mode
 *
 * @param options - Add command options
 * @param cwd - Current working directory
 */
export async function runAddCommand(
  options: AddCommandOptions,
  cwd?: string,
): Promise<void> {
  const workingDir = cwd ?? process.cwd();

  // --pattern mode: bulk add all matching dependencies
  if (options.pattern) {
    // Validate regex
    try {
      new RegExp(options.pattern);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid regex pattern "${options.pattern}": ${msg}`);
    }

    const { waitUntilExit } = render(
      React.createElement(BulkAddView, {
        pattern: options.pattern,
        cwd: workingDir,
        local: options.local ?? false,
        ref: options.ref,
      }),
    );
    await waitUntilExit();
    return;
  }

  // -p / --package mode: interactive single-package add
  if (!options.package) {
    console.error('Error: either --package or --pattern must be provided');
    console.error('  Usage: claude-assets-sync add -p <name>');
    console.error('         claude-assets-sync add --pattern <regex>');
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const { waitUntilExit } = render(
      React.createElement(AddCommand, {
        packageName: options.package!,
        local: options.local ?? false,
        ref: options.ref,
        onComplete: async (selection: AddCommandSelection) => {
          try {
            // Convert selection to sync operation
            await performSync(selection, workingDir);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        onError: (error: Error) => {
          reject(error);
        },
        onCancel: () => {
          console.log('\nSync cancelled');
          resolve();
        },
      }),
    );

    waitUntilExit().catch(reject);
  });
}

/**
 * Perform sync based on user selection
 */
async function performSync(
  selection: AddCommandSelection,
  cwd: string,
): Promise<void> {
  // Build exclusions from excluded assets
  const exclusions: { directories: string[]; files: string[] } = {
    directories: [],
    files: [],
  };

  for (const assetType of Object.keys(selection.excludedAssets)) {
    for (const excludedPath of selection.excludedAssets[assetType]) {
      // All excluded items go to files list - sync.ts handles
      // prefix matching for directory skills (e.g., "skills/expert"
      // will match "skills/expert/SKILL.md", "skills/expert/knowledge/api.md", etc.)
      exclusions.files.push(excludedPath);
    }
  }

  // Run sync with exclusions
  await syncPackage(
    selection.packageName,
    {
      force: true, // Always force when adding
      dryRun: false,
      local: selection.source === 'local',
      ref: selection.ref,
      flat: true,
    },
    cwd,
    exclusions.directories.length > 0 || exclusions.files.length > 0
      ? exclusions
      : undefined,
    undefined, // outputDir
  );
}
