import React from 'react';
import { Box, Text } from 'ink';

import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';

interface ErrorPanelProps {
  readonly error: Error;
}

export function ErrorPanel({
  error,
}: ErrorPanelProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Text color={colors.danger} bold>
        {icons.cross} {error.name ?? 'Error'}
      </Text>
      <Box marginLeft={2} marginTop={1}>
        <Text color={colors.danger}>
          {error.message}
        </Text>
      </Box>
      {error.stack ? (
        <Box marginLeft={2} marginTop={1}>
          <Text color={colors.muted} dimColor>
            {error.stack
              .split('\n')
              .slice(1, 4)
              .map((l) => l.trim())
              .join('\n')}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
