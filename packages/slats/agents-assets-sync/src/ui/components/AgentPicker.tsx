import type React from 'react';
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';

import type { AgentType } from '../../core/index.js';
import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';

interface AgentPickerProps {
  readonly onSelect: (agents: readonly AgentType[]) => void;
}

const ITEMS: ReadonlyArray<{ value: AgentType; hint: string }> = [
  { value: 'claude', hint: '.claude/{skills,rules,commands}' },
  { value: 'codex', hint: '.codex/skills + AGENTS.md' },
];

/**
 * Multi-select agent picker.
 *
 * `ink-select-input` — used by `ScopePicker` — answers with exactly one value,
 * but agents are not exclusive: injecting for both in one run is the point of
 * this tool. Hence a checkbox list driven by `useInput`.
 */
export function AgentPicker({
  onSelect,
}: AgentPickerProps): React.ReactElement {
  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<ReadonlySet<AgentType>>(
    new Set<AgentType>(['claude']),
  );

  useInput((input, key) => {
    if (key.upArrow) setCursor((c) => (c === 0 ? ITEMS.length - 1 : c - 1));
    else if (key.downArrow) setCursor((c) => (c + 1) % ITEMS.length);
    else if (input === ' ') {
      const value = ITEMS[cursor]?.value;
      if (!value) return;
      setChosen((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
    } else if (key.return && chosen.size > 0) {
      // Preserve the listed order rather than selection order, so the run
      // reads the same regardless of how the boxes were ticked.
      onSelect(ITEMS.map((it) => it.value).filter((v) => chosen.has(v)));
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color={colors.primary}>
        {icons.triangleRight} Select the target agent(s)
      </Text>
      <Box flexDirection="column" marginLeft={2} marginTop={1}>
        {ITEMS.map((item, index) => {
          const focused = index === cursor;
          const ticked = chosen.has(item.value);
          return (
            <Box key={item.value}>
              <Text color={focused ? colors.accent : colors.muted} bold>
                {focused ? icons.triangleRight : ' '}{' '}
              </Text>
              <Text color={ticked ? colors.success : colors.muted} bold>
                {ticked ? icons.check : icons.bulletPending}{' '}
              </Text>
              <Text color={focused ? colors.primary : colors.muted} bold={focused}>
                {item.value.padEnd(8)}
              </Text>
              <Text color={colors.muted} dimColor>
                {item.hint}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box marginLeft={2} marginTop={1}>
        <Text color={colors.muted} dimColor>
          ↑↓ move · space toggle · enter confirm
        </Text>
      </Box>
    </Box>
  );
}
