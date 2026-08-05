import React from 'react';
import { Box, Text } from 'ink';

import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';
import type { Phase } from '../types/index.js';
import { Spinner } from './Spinner.js';

const STEPS = [
  { key: 'resolve', label: 'resolve', phases: ['booting', 'resolving'] },
  { key: 'scope', label: 'scope', phases: ['scope-select'] },
  { key: 'plan', label: 'plan', phases: ['planning', 'diff-review', 'force-confirm'] },
  { key: 'apply', label: 'apply', phases: ['applying'] },
  { key: 'done', label: 'done', phases: [] },
] as const;

interface StepTrackerProps {
  readonly phase: Phase;
  readonly targetCount?: number;
  readonly scope?: string;
}

function stepState(
  phaseIndex: number,
  stepIndex: number,
): 'done' | 'active' | 'pending' {
  if (stepIndex < phaseIndex) return 'done';
  if (stepIndex === phaseIndex) return 'active';
  return 'pending';
}

function phaseToIndex(kind: Phase['kind']): number {
  if (kind === 'summary' || kind === 'error') return STEPS.length;
  for (let i = 0; i < STEPS.length; i += 1) {
    const step = STEPS[i];
    if ((step.phases as readonly string[]).includes(kind)) return i;
  }
  return 0;
}

export function StepTracker({
  phase,
  targetCount,
  scope,
}: StepTrackerProps): React.ReactElement {
  const phaseIndex = phaseToIndex(phase.kind);
  return (
    <Box>
      {STEPS.map((step, idx) => {
        const state = stepState(phaseIndex, idx);
        const bulletColor =
          state === 'done'
            ? colors.success
            : state === 'active'
              ? colors.warn
              : colors.muted;
        return (
          <React.Fragment key={step.key}>
            {idx > 0 ? (
              <Text color={colors.muted} dimColor>
                {' '}
                {icons.divider}{' '}
              </Text>
            ) : null}
            {state === 'active' ? (
              <Spinner color={bulletColor} />
            ) : (
              <Text color={bulletColor}>
                {state === 'done' ? icons.bulletDone : icons.bulletPending}
              </Text>
            )}
            <Text
              color={bulletColor}
              bold={state === 'active'}
              dimColor={state === 'pending'}
            >
              {' '}
              {step.label}
            </Text>
          </React.Fragment>
        );
      })}
      {typeof targetCount === 'number' || scope ? (
        <Text color={colors.muted} dimColor>
          {'     '}
          {typeof targetCount === 'number' ? `${targetCount} target${targetCount === 1 ? '' : 's'}` : ''}
          {scope ? ` · scope ${scope}` : ''}
        </Text>
      ) : null}
    </Box>
  );
}
