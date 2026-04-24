import React from 'react';
import { Box, Text } from 'ink';

import type { InjectPlan } from '../../core/buildPlan/index.js';
import { colors } from '../theme/colors.js';
import { limits } from '../theme/layout.js';
import { ActionRow } from './ActionRow.js';

interface PlanTableProps {
  readonly plan: InjectPlan;
  readonly maxRows?: number;
}

export function PlanTable({
  plan,
  maxRows = limits.maxPlanRowsBeforeTruncate,
}: PlanTableProps): React.ReactElement {
  const actions = plan.actions;
  const overflow = actions.length > maxRows;
  const shown = overflow ? actions.slice(0, limits.planTruncatedReveal) : actions;
  const hidden = actions.length - shown.length;

  return (
    <Box flexDirection="column">
      {shown.map((action) => (
        <ActionRow key={`${action.kind}-${action.relPath}`} action={action} />
      ))}
      {overflow ? (
        <Box marginLeft={2}>
          <Text color={colors.muted} dimColor>
            … {hidden} more action(s) hidden
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
