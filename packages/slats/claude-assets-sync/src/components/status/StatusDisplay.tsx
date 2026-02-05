import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { StatusTreeNode } from './StatusTreeNode';

export interface PackageStatusItem {
  name: string;
  localVersion: string;
  remoteVersion?: string;
  status: 'up-to-date' | 'outdated' | 'error' | 'unknown';
  syncedAt: string;
  error?: string;
  files: Record<string, Array<string | { original: string; transformed: string }>>;
  fileCount: number;
}

export interface StatusDisplayProps {
  packages: PackageStatusItem[];
  loading: boolean;
  summary: {
    upToDate: number;
    outdated: number;
    error: number;
    unknown: number;
  };
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  packages,
  loading,
  summary,
}) => {
  if (loading) {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Checking package versions...
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Package Sync Status</Text>
      </Box>

      {packages.map((pkg) => {
        const assetTypes = Object.keys(pkg.files || {});

        return (
          <Box key={pkg.name} flexDirection="column" marginBottom={1}>
            {/* Package level */}
            <StatusTreeNode
              label={pkg.name}
              depth={0}
              type="package"
              expanded={true}
              status={pkg.status}
              version={pkg.localVersion}
              remoteVersion={pkg.remoteVersion}
              fileCount={pkg.fileCount}
            />

            {/* Asset types */}
            {assetTypes.map((assetType) => {
              const files = pkg.files[assetType];
              const fileArray = Array.isArray(files) ? files : [];

              return (
                <Box key={assetType} flexDirection="column">
                  <StatusTreeNode
                    label={assetType}
                    depth={1}
                    type="assetType"
                    expanded={true}
                    fileCount={fileArray.length}
                  />

                  {/* Files */}
                  {fileArray.map((file, index) => {
                    const fileName = typeof file === 'string' ? file : file.transformed;
                    return (
                      <StatusTreeNode
                        key={`${assetType}-${index}`}
                        label={fileName}
                        depth={2}
                        type="file"
                      />
                    );
                  })}
                </Box>
              );
            })}

            {/* Sync timestamp */}
            <Box marginLeft={2}>
              <Text dimColor>Last synced: {new Date(pkg.syncedAt).toLocaleString()}</Text>
            </Box>

            {/* Error message if exists */}
            {pkg.error && (
              <Box marginLeft={2}>
                <Text color="red">Error: {pkg.error}</Text>
              </Box>
            )}
          </Box>
        );
      })}

      {/* Summary */}
      <Box marginTop={1} paddingTop={1} borderStyle="single" borderTop borderColor="gray">
        <Text dimColor>
          Summary: {summary.upToDate} up to date
          {summary.outdated > 0 && `, ${summary.outdated} updates available`}
          {summary.error > 0 && `, ${summary.error} errors`}
          {summary.unknown > 0 && `, ${summary.unknown} unknown`}
        </Text>
      </Box>
    </Box>
  );
};
