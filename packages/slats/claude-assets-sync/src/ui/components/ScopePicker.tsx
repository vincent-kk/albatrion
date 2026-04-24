import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

import type { Scope } from '../../core/index.js';
import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';

interface ScopePickerProps {
  readonly onSelect: (scope: Scope) => void;
}

const ITEMS: Array<{ label: string; value: Scope; hint: string }> = [
  {
    label: 'user',
    value: 'user',
    hint: '~/.claude (global)',
  },
  {
    label: 'project',
    value: 'project',
    hint: 'nearest ancestor .claude (or cwd)',
  },
];

export function ScopePicker({
  onSelect,
}: ScopePickerProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color={colors.primary}>
        {icons.triangleRight} Select the target scope
      </Text>
      <Box marginLeft={2} marginTop={1}>
        <SelectInput<Scope>
          items={ITEMS.map((it) => ({ label: it.label, value: it.value }))}
          onSelect={(item) => onSelect(item.value)}
          itemComponent={({ isSelected, label }) => {
            const entry = ITEMS.find((it) => it.label === label);
            return (
              <Box>
                <Text color={isSelected ? colors.accent : colors.muted} bold>
                  {isSelected ? icons.triangleRight : ' '}{' '}
                </Text>
                <Text color={isSelected ? colors.primary : colors.muted} bold={isSelected}>
                  {label.padEnd(8)}
                </Text>
                {entry ? (
                  <Text color={colors.muted} dimColor>
                    {entry.hint}
                  </Text>
                ) : null}
              </Box>
            );
          }}
        />
      </Box>
    </Box>
  );
}
