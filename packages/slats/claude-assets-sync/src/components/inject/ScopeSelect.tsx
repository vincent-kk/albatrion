import { Box, Text, render } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';

import type { Scope } from '../../core/scope.js';

const ITEMS: { label: string; value: Scope }[] = [
  { label: 'user    (~/.claude)', value: 'user' },
  { label: 'project (<cwd>/.claude)', value: 'project' },
  { label: 'local   (<cwd>/.claude, gitignored region)', value: 'local' },
];

export async function selectScopeAsync(): Promise<Scope> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <ScopeSelect
        onSelect={(scope) => {
          unmount();
          resolve(scope);
        }}
      />,
    );
  });
}

const ScopeSelect: React.FC<{ onSelect: (scope: Scope) => void }> = ({
  onSelect,
}) => (
  <Box flexDirection="column">
    <Text color="cyan">? Select scope:</Text>
    <SelectInput
      items={ITEMS}
      onSelect={(item) => onSelect(item.value as Scope)}
    />
  </Box>
);
