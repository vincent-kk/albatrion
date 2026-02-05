import React from 'react';
import { Box, Text } from 'ink';

export interface PackageStatusCardProps {
  name: string;
  localVersion: string;
  remoteVersion?: string;
  status: 'up-to-date' | 'outdated' | 'error' | 'unknown';
  syncedAt: string;
  error?: string;
}

export const PackageStatusCard: React.FC<PackageStatusCardProps> = ({
  name,
  localVersion,
  remoteVersion,
  status,
  syncedAt,
  error,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'up-to-date':
        return '✓';
      case 'outdated':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '?';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'up-to-date':
        return 'green';
      case 'outdated':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    if (error) return `Error: ${error}`;
    switch (status) {
      case 'up-to-date':
        return 'Up to date';
      case 'outdated':
        return 'Update available';
      case 'error':
        return 'Error checking version';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box flexDirection="column" paddingY={1}>
      <Box>
        <Text color={getStatusColor()} bold>
          {getStatusIcon()}{' '}
        </Text>
        <Text color="cyan" bold>
          {name}
        </Text>
      </Box>
      <Box paddingLeft={2}>
        <Text dimColor>Local:  {localVersion}</Text>
        <Text> │ </Text>
        <Text dimColor>
          Remote:{' '}
          {remoteVersion || (error ? 'Error' : '(not available)')}
        </Text>
      </Box>
      <Box paddingLeft={2}>
        <Text dimColor>Status: </Text>
        <Text color={getStatusColor()}>{getStatusText()}</Text>
      </Box>
      <Box paddingLeft={2}>
        <Text dimColor>
          Synced: {new Date(syncedAt).toLocaleString()}
        </Text>
      </Box>
    </Box>
  );
};
