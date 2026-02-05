import React from 'react';
import { Box, Text } from 'ink';

export interface EditableTreeItemProps {
  label: string;
  depth: number;
  selected: boolean;
  markedForDeletion?: boolean;
  markedForAddition?: boolean;
  onToggleDelete?: () => void;
}

/**
 * Editable tree item component for list view
 */
export const EditableTreeItem: React.FC<EditableTreeItemProps> = ({
  label,
  depth,
  selected,
  markedForDeletion = false,
  markedForAddition = false,
}) => {
  const indent = '  '.repeat(depth);

  let color = 'white';
  let prefix = '';

  if (markedForDeletion) {
    color = 'red';
    prefix = '[-] ';
  } else if (markedForAddition) {
    color = 'green';
    prefix = '[+] ';
  }

  const displayLabel = `${indent}${prefix}${label}`;

  return (
    <Box>
      <Text
        bold={selected}
        color={selected ? 'cyan' : color}
        dimColor={!selected && !markedForDeletion && !markedForAddition}
      >
        {selected ? '> ' : '  '}
        {displayLabel}
      </Text>
    </Box>
  );
};
