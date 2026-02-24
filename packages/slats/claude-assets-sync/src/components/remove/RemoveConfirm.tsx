import { useApp } from 'ink';
import React, { useCallback } from 'react';

import { Confirm } from '@/claude-assets-sync/components/shared';

interface RemoveConfirmProps {
  packageName: string;
  filesToRemove: Array<{ assetType: string; path: string }>;
  onConfirm: (yes: boolean) => void;
}

export const RemoveConfirm: React.FC<RemoveConfirmProps> = ({
  packageName,
  filesToRemove,
  onConfirm,
}) => {
  const { exit } = useApp();

  const handleConfirm = useCallback(
    (yes: boolean) => {
      onConfirm(yes);
      exit();
    },
    [onConfirm, exit],
  );

  return (
    <Confirm
      message={`Remove ${filesToRemove.length} file(s) from ${packageName}?`}
      onConfirm={handleConfirm}
      defaultYes={false}
    />
  );
};
