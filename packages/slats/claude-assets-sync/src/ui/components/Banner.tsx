import React from 'react';
import { Box, Text } from 'ink';

import { colors } from '../theme/colors.js';

interface BannerProps {
  readonly version: string;
  readonly scope?: string;
}

export function Banner({
  version,
  scope,
}: BannerProps): React.ReactElement {
  return (
    <Box
      borderStyle="round"
      borderColor={colors.primary}
      paddingX={1}
      alignSelf="flex-start"
    >
      <Text bold color={colors.primary}>
        claude-sync
      </Text>
      <Text color={colors.muted}>
        {' '}v{version}
      </Text>
      {scope ? (
        <Text>
          <Text color={colors.muted}>{'  →  '}</Text>
          <Text color={colors.accent} bold>
            {scope}
          </Text>
        </Text>
      ) : null}
    </Box>
  );
}
