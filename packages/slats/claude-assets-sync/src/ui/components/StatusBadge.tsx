import React from 'react';
import { Text } from 'ink';

import { colors } from '../theme/colors.js';

export type StatusKind =
  | 'created'
  | 'updated'
  | 'skipped'
  | 'warn'
  | 'delete'
  | 'pending'
  | 'running'
  | 'done'
  | 'failed';

interface StatusBadgeProps {
  readonly kind: StatusKind;
  readonly label?: string;
}

const BADGES: Record<StatusKind, { label: string; color: string }> = {
  created: { label: 'CREATED', color: colors.success },
  updated: { label: 'UPDATED', color: colors.success },
  skipped: { label: 'SKIPPED', color: colors.muted },
  warn: { label: 'WARN', color: colors.warn },
  delete: { label: 'DELETE', color: colors.danger },
  pending: { label: 'PENDING', color: colors.muted },
  running: { label: 'RUNNING', color: colors.primary },
  done: { label: 'DONE', color: colors.success },
  failed: { label: 'FAILED', color: colors.danger },
};

export function StatusBadge({
  kind,
  label,
}: StatusBadgeProps): React.ReactElement {
  const badge = BADGES[kind];
  return (
    <Text color={badge.color} bold>
      {label ?? badge.label}
    </Text>
  );
}
