import React from 'react';
import { Box, Text } from 'ink';

import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';
import { widths } from '../theme/layout.js';

interface ProgressBarProps {
  readonly done: number;
  readonly total: number;
  readonly width?: number;
  readonly etaSeconds?: number;
  readonly label?: string;
}

function formatEta(seconds: number | undefined): string | null {
  if (seconds === undefined || !Number.isFinite(seconds)) return null;
  if (seconds < 1) return '<1s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m${s}s`;
}

export function ProgressBar({
  done,
  total,
  width = widths.progressBarDefault,
  etaSeconds,
  label,
}: ProgressBarProps): React.ReactElement {
  const safeTotal = Math.max(total, 1);
  const ratio = Math.min(Math.max(done / safeTotal, 0), 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const percent = Math.round(ratio * 100);
  const eta = formatEta(etaSeconds);

  return (
    <Box>
      <Text color={colors.success}>{icons.blockFull.repeat(filled)}</Text>
      <Text color={colors.muted} dimColor>
        {icons.blockEmpty.repeat(empty)}
      </Text>
      <Text color={colors.muted}>
        {' '}
        {String(percent).padStart(3)}%
      </Text>
      <Text color={colors.muted} dimColor>
        {'  '}({done}/{total}
        {eta ? ` · ETA ${eta}` : ''})
      </Text>
      {label ? (
        <Text color={colors.muted} dimColor>
          {'  '}
          {label}
        </Text>
      ) : null}
    </Box>
  );
}
