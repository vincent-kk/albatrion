import { Box, Text, render } from 'ink';
import React from 'react';

import { Confirm } from '../shared/Confirm.js';

export async function confirmForceAsync(
  divergedCount: number,
  orphanCount: number,
  relPaths: string[],
): Promise<boolean> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <ForceConfirm
        divergedCount={divergedCount}
        orphanCount={orphanCount}
        relPaths={relPaths}
        onConfirm={(yes) => {
          unmount();
          resolve(yes);
        }}
      />,
    );
  });
}

interface ForceConfirmProps {
  divergedCount: number;
  orphanCount: number;
  relPaths: string[];
  onConfirm: (yes: boolean) => void;
}

const ForceConfirm: React.FC<ForceConfirmProps> = ({
  divergedCount,
  orphanCount,
  relPaths,
  onConfirm,
}) => {
  const extra = Math.max(0, divergedCount + orphanCount - relPaths.length);
  return (
    <Box flexDirection="column">
      <Text color="yellow">
        This will overwrite {divergedCount} diverged file(s)
        {orphanCount > 0 ? ` and delete ${orphanCount} orphan(s)` : ''}:
      </Text>
      {relPaths.map((p) => (
        <Text key={p}>
          <Text color="gray">  - </Text>
          {p}
        </Text>
      ))}
      {extra > 0 ? <Text color="gray">  ... and {extra} more</Text> : null}
      <Confirm
        message="Do you have these in git? Proceed?"
        defaultYes={false}
        onConfirm={onConfirm}
      />
    </Box>
  );
};
