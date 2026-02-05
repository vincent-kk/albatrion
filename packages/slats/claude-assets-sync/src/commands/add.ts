import { render } from 'ink';
import React from 'react';

import { AddCommand } from '@/claude-assets-sync/components/add/index.js';
import { syncPackage } from '@/claude-assets-sync/core/sync.js';
import type { AddCommandSelection } from '@/claude-assets-sync/utils/types.js';

export interface AddCommandOptions {
  package: string;
  local?: boolean;
  ref?: string;
}

/**
 * Run the add command with interactive asset selection
 *
 * @param options - Add command options
 * @param cwd - Current working directory
 */
export async function runAddCommand(
  options: AddCommandOptions,
  cwd?: string,
): Promise<void> {
  const workingDir = cwd ?? process.cwd();

  return new Promise((resolve, reject) => {
    const { waitUntilExit } = render(
      React.createElement(AddCommand, {
        packageName: options.package,
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
    for (const path of selection.excludedAssets[assetType]) {
      // Determine if it's a directory or file based on path
      // For now, assume directories don't have extensions
      if (path.includes('.')) {
        exclusions.files.push(path);
      } else {
        exclusions.directories.push(path);
      }
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
