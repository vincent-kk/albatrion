import React from 'react';
import { Box, Text } from 'ink';

export interface StatusTreeNodeProps {
  label: string;
  depth: number;
  type: 'package' | 'assetType' | 'file';
  expanded?: boolean;
  status?: 'up-to-date' | 'outdated' | 'error' | 'unknown';
  version?: string;
  remoteVersion?: string;
  fileCount?: number;
}

/**
 * Read-only tree node for status display
 */
export const StatusTreeNode: React.FC<StatusTreeNodeProps> = ({
  label,
  depth,
  type,
  expanded = false,
  status,
  version,
  remoteVersion,
  fileCount,
}) => {
  const indent = '  '.repeat(depth);

  // Icon based on type and state
  const getIcon = () => {
    if (type === 'package') {
      if (status === 'up-to-date') return '●';
      if (status === 'outdated') return '◐';
      if (status === 'error') return '○';
      return '○';
    }
    if (type === 'assetType') {
      return expanded ? '▼' : '▶';
    }
    return '•';
  };

  // Color based on status or type
  const getColor = () => {
    if (type === 'package') {
      if (status === 'up-to-date') return 'green';
      if (status === 'outdated') return 'yellow';
      if (status === 'error') return 'red';
      return 'gray';
    }
    if (type === 'assetType') return 'cyan';
    return 'white';
  };

  return (
    <Box>
      <Text dimColor>{indent}</Text>
      <Text color={getColor()}>{getIcon()} </Text>
      <Text color={getColor()} bold={type !== 'file'}>
        {label}
      </Text>
      {type === 'package' && version && (
        <>
          <Text dimColor> @ </Text>
          <Text color="blue">{version}</Text>
          {remoteVersion && remoteVersion !== version && (
            <>
              <Text dimColor> → </Text>
              <Text color="yellow">{remoteVersion}</Text>
            </>
          )}
          {fileCount !== undefined && (
            <Text dimColor> ({fileCount} files)</Text>
          )}
        </>
      )}
    </Box>
  );
};
