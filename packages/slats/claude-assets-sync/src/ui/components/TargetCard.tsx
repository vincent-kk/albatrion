import React from 'react';
import { Box, Text } from 'ink';

import type { Action, InjectPlan } from '../../core/buildPlan/index.js';
import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';
import type { ConsumerPackage } from '../../commands/runCli/type.js';
import { PlanTable } from './PlanTable.js';

interface TargetCardProps {
  readonly target: ConsumerPackage;
  readonly plan?: InjectPlan;
  readonly expanded?: boolean;
  readonly highlighted?: boolean;
}

interface Counts {
  readonly copy: number;
  readonly skip: number;
  readonly warn: number;
  readonly del: number;
}

function countActions(actions: readonly Action[]): Counts {
  let copy = 0;
  let skip = 0;
  let warn = 0;
  let del = 0;
  for (const action of actions) {
    if (action.kind === 'copy') copy += 1;
    else if (action.kind === 'skip-uptodate') skip += 1;
    else if (action.kind === 'warn-diverged' || action.kind === 'warn-orphan')
      warn += 1;
    else if (action.kind === 'delete') del += 1;
  }
  return { copy, skip, warn, del };
}

export function TargetCard({
  target,
  plan,
  expanded = true,
  highlighted = false,
}: TargetCardProps): React.ReactElement {
  const counts = plan ? countActions(plan.actions) : null;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color={highlighted ? colors.accent : colors.primary} bold>
          {icons.triangleRight}{' '}
        </Text>
        <Text bold>
          {target.name}
        </Text>
        <Text color={colors.muted} dimColor>
          @{target.version}
        </Text>
        {counts ? (
          <Text color={colors.muted}>
            {'   ['}
            <Text color={colors.success} bold>
              {counts.copy} copy
            </Text>
            {' · '}
            <Text color={colors.muted} dimColor>
              {counts.skip} skip
            </Text>
            {counts.warn > 0 ? (
              <>
                {' · '}
                <Text color={colors.warn} bold>
                  {counts.warn} {icons.warning}
                </Text>
              </>
            ) : null}
            {counts.del > 0 ? (
              <>
                {' · '}
                <Text color={colors.danger} bold>
                  {counts.del} {icons.minus}
                </Text>
              </>
            ) : null}
            {']'}
          </Text>
        ) : null}
      </Box>
      {expanded && plan ? (
        <Box marginLeft={2}>
          <PlanTable plan={plan} />
        </Box>
      ) : null}
    </Box>
  );
}
