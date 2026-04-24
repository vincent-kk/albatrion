import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

import type { Warning } from '../types/index.js';
import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';
import { limits } from '../theme/layout.js';

interface ConfirmForceProps {
  readonly warnings: readonly Warning[];
  readonly onAnswer: (ok: boolean) => void;
}

type Choice = 'accept' | 'cancel' | 'expand';

export function ConfirmForce({
  warnings,
  onAnswer,
}: ConfirmForceProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const showAll = expanded || warnings.length <= limits.maxWarningsBeforeCollapse;
  const shown = showAll
    ? warnings
    : warnings.slice(0, limits.maxWarningsBeforeCollapse);
  const hidden = warnings.length - shown.length;

  const diverged = warnings.filter((w) => w.kind === 'warn-diverged').length;
  const orphans = warnings.filter((w) => w.kind === 'warn-orphan').length;

  const items: Array<{ label: string; value: Choice }> = [
    { label: `Yes, overwrite ${warnings.length} path(s)`, value: 'accept' },
    { label: 'No, cancel', value: 'cancel' },
  ];
  if (!showAll) {
    items.push({ label: `Show all (${hidden} hidden)`, value: 'expand' });
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.warn} bold>
        {icons.warning} {warnings.length} path(s) need --force confirmation
      </Text>
      <Box marginLeft={2}>
        <Text color={colors.muted} dimColor>
          {diverged} diverged · {orphans} orphan
        </Text>
      </Box>
      <Box flexDirection="column" marginLeft={2} marginTop={1}>
        {shown.map((warning) => (
          <Box key={`${warning.packageName}:${warning.relPath}`}>
            <Text
              color={warning.kind === 'warn-diverged' ? colors.warn : colors.accent}
              bold
            >
              {warning.kind === 'warn-diverged' ? icons.warning : icons.question}{' '}
            </Text>
            <Text color={colors.muted} dimColor>
              [{warning.packageName}]{' '}
            </Text>
            <Text>{warning.relPath}</Text>
          </Box>
        ))}
        {!showAll ? (
          <Text color={colors.muted} dimColor>
            … {hidden} more hidden
          </Text>
        ) : null}
      </Box>
      <Box marginLeft={2} marginTop={1}>
        <SelectInput<Choice>
          items={items}
          onSelect={(item) => {
            if (item.value === 'accept') onAnswer(true);
            else if (item.value === 'cancel') onAnswer(false);
            else setExpanded(true);
          }}
        />
      </Box>
    </Box>
  );
}
