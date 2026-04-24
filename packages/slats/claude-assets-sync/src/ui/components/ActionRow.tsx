import React from 'react';
import { Box, Text } from 'ink';

import type { Action } from '../../core/buildPlan/index.js';
import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';

interface ActionRowProps {
  readonly action: Action;
}

interface Visual {
  readonly icon: string;
  readonly color: string;
  readonly dim?: boolean;
  readonly note?: string;
}

function visualFor(action: Action): Visual {
  switch (action.kind) {
    case 'copy':
      return { icon: icons.plus, color: colors.success };
    case 'skip-uptodate':
      return {
        icon: icons.equals,
        color: colors.muted,
        dim: true,
        note: 'up-to-date',
      };
    case 'warn-diverged':
      return {
        icon: icons.warning,
        color: colors.warn,
        note: 'diverged',
      };
    case 'warn-orphan':
      return {
        icon: icons.question,
        color: colors.warn,
        note: 'orphan',
      };
    case 'delete':
      return {
        icon: icons.minus,
        color: colors.danger,
        note: 'delete',
      };
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return { icon: '?', color: colors.muted };
    }
  }
}

export function ActionRow({ action }: ActionRowProps): React.ReactElement {
  const visual = visualFor(action);
  return (
    <Box>
      <Text color={visual.color} bold>
        {' '}
        {visual.icon}{' '}
      </Text>
      <Text color={colors.muted} dimColor={visual.dim}>
        {action.relPath}
      </Text>
      {visual.note ? (
        <Text color={colors.muted} dimColor>
          {'  '}({visual.note})
        </Text>
      ) : null}
    </Box>
  );
}
