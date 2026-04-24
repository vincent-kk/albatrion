import React from 'react';
import { Box, Text } from 'ink';
import InkSpinner from 'ink-spinner';

import { colors } from '../theme/colors.js';

interface SpinnerProps {
  readonly label?: string;
  readonly color?: string;
  readonly variant?: 'dots' | 'line' | 'arc';
}

export function Spinner({
  label,
  color = colors.primary,
  variant = 'dots',
}: SpinnerProps): React.ReactElement {
  return (
    <Box>
      <Text color={color}>
        <InkSpinner type={variant} />
      </Text>
      {label ? (
        <Text color={colors.muted}>
          {' '}
          {label}
        </Text>
      ) : null}
    </Box>
  );
}
