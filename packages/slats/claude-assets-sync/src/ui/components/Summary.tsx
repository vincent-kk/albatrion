import React from 'react';
import { Box, Text } from 'ink';

import type { InjectReport } from '../../core/index.js';
import { colors } from '../theme/colors.js';

interface SummaryProps {
  readonly reports: readonly InjectReport[];
  readonly exitCode: 0 | 1 | 2;
  readonly dryRun: boolean;
}

interface Totals {
  readonly created: number;
  readonly updated: number;
  readonly skipped: number;
  readonly warnings: number;
  readonly deleted: number;
}

function aggregate(reports: readonly InjectReport[]): Totals {
  return reports.reduce<Totals>(
    (acc, report) => ({
      created: acc.created + report.created.length,
      updated: acc.updated + report.updated.length,
      skipped: acc.skipped + report.skipped.length,
      warnings: acc.warnings + report.warnings.length,
      deleted: acc.deleted + report.deleted.length,
    }),
    { created: 0, updated: 0, skipped: 0, warnings: 0, deleted: 0 },
  );
}

function exitColor(code: 0 | 1 | 2): string {
  if (code === 0) return colors.success;
  if (code === 2) return colors.warn;
  return colors.danger;
}

interface RowProps {
  readonly label: string;
  readonly value: number | string;
  readonly labelColor: string;
  readonly valueColor?: string;
  readonly labelBold?: boolean;
  readonly valueBold?: boolean;
}

function Row({
  label,
  value,
  labelColor,
  valueColor,
  labelBold,
  valueBold,
}: RowProps): React.ReactElement {
  return (
    <Box>
      <Box width={10}>
        <Text color={labelColor} bold={labelBold}>
          {label}
        </Text>
      </Box>
      <Text color={valueColor ?? colors.muted} bold={valueBold}>
        {String(value).padStart(3)}
      </Text>
    </Box>
  );
}

export function Summary({
  reports,
  exitCode,
  dryRun,
}: SummaryProps): React.ReactElement {
  const totals = aggregate(reports);
  const exitTone = exitColor(exitCode);

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={colors.primary}
      paddingX={2}
      paddingY={0}
      marginTop={1}
      alignSelf="flex-start"
    >
      <Box>
        <Text bold color={colors.primary}>
          Summary{dryRun ? ' (dry-run)' : ''}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Box flexDirection="column" marginRight={4}>
          <Row
            label="created"
            value={totals.created}
            labelColor={colors.success}
            labelBold
          />
          <Row
            label="skipped"
            value={totals.skipped}
            labelColor={colors.muted}
          />
          <Row
            label="deleted"
            value={totals.deleted}
            labelColor={colors.danger}
          />
        </Box>
        <Box flexDirection="column">
          <Row
            label="updated"
            value={totals.updated}
            labelColor={colors.success}
          />
          <Row
            label="warnings"
            value={totals.warnings}
            labelColor={colors.warn}
            labelBold
          />
          <Row
            label="exit"
            value={exitCode}
            labelColor={exitTone}
            labelBold
            valueColor={exitTone}
            valueBold
          />
        </Box>
      </Box>
    </Box>
  );
}
