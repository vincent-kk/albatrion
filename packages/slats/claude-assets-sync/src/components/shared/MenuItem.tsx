import { Text } from 'ink';
import React from 'react';

interface MenuItemProps {
  isSelected?: boolean;
  label: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  isSelected = false,
  label,
}) => {
  // Color "Delete" or "Remove" labels in red
  if (label === 'Delete' || label === 'Remove') {
    return (
      <Text bold={isSelected} color="red">
        {label}
      </Text>
    );
  }

  // Parse label with count badge (e.g., "Backups (3)")
  const match = label.match(/^(.+?)\s+\((\d+)\)$/);
  if (match) {
    const [, name, count] = match;
    return (
      <Text>
        <Text bold={isSelected}>{name}</Text> <Text dimColor>({count})</Text>
      </Text>
    );
  }

  return <Text bold={isSelected}>{label}</Text>;
};
