import React from 'react';
import { Box, Text } from 'ink';

import { colors } from '../theme/colors.js';
import type { Phase } from '../types/index.js';

interface FooterProps {
  readonly phase: Phase;
  readonly version: string;
}

function hintsFor(kind: Phase['kind']): string {
  switch (kind) {
    case 'scope-select':
      return '↑↓:select · enter:confirm · ctrl-c:cancel';
    case 'diff-review':
      return 'enter:apply · a:accept all warn · esc:cancel';
    case 'force-confirm':
      return 'y:accept · n:cancel';
    case 'applying':
      return 'ctrl-c:abort';
    case 'summary':
      return 'enter:exit';
    case 'error':
      return 'enter:exit';
    default:
      return 'ctrl-c:cancel';
  }
}

export function Footer({
  phase,
  version,
}: FooterProps): React.ReactElement {
  return (
    <Box marginTop={1}>
      <Text color={colors.muted} dimColor>
        {hintsFor(phase.kind)}
      </Text>
      <Text color={colors.muted} dimColor>
        {'        v'}
        {version}
      </Text>
      <Text color={colors.muted} dimColor>
        {'  phase: '}
        {phase.kind}
      </Text>
    </Box>
  );
}
