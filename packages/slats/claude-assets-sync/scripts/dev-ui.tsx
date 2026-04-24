#!/usr/bin/env node
import { render, Box, Text, useApp, useInput } from 'ink';
import React, { useEffect, useState } from 'react';

import { Banner } from '../src/ui/components/Banner.js';
import { ConfirmForce } from '../src/ui/components/ConfirmForce.js';
import { ErrorPanel } from '../src/ui/components/ErrorPanel.js';
import { Footer } from '../src/ui/components/Footer.js';
import { ProgressBar } from '../src/ui/components/ProgressBar.js';
import { ScopePicker } from '../src/ui/components/ScopePicker.js';
import { Spinner } from '../src/ui/components/Spinner.js';
import { StepTracker } from '../src/ui/components/StepTracker.js';
import { Summary } from '../src/ui/components/Summary.js';
import { TargetCard } from '../src/ui/components/TargetCard.js';
import { colors } from '../src/ui/theme/colors.js';
import { icons } from '../src/ui/theme/icons.js';
import type { Phase } from '../src/ui/types/index.js';

import { buildPhase, PHASES, type PhaseKey } from './dev-ui-fixtures.js';

const VERSION = '0.3.0-dev';

interface CliArgs {
  mode: 'usage' | 'phase' | 'tour';
  phase?: PhaseKey;
  tourMs?: number;
}

function parseArgs(argv: readonly string[]): CliArgs {
  if (argv.includes('--tour')) {
    const msArg = argv.find((a) => a.startsWith('--ms='));
    const tourMs = msArg ? Number(msArg.slice(5)) : 2500;
    return { mode: 'tour', tourMs };
  }
  const phaseArg = argv.find((a) => a.startsWith('--phase='));
  if (phaseArg) {
    const phaseKey = phaseArg.slice(8);
    if (!PHASES.includes(phaseKey as PhaseKey)) {
      console.error(
        `Unknown phase: ${phaseKey}. Available: ${PHASES.join(', ')}`,
      );
      process.exit(2);
    }
    return { mode: 'phase', phase: phaseKey as PhaseKey };
  }
  return { mode: 'usage' };
}

function Usage(): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>
        {icons.triangleRight} claude-assets-sync — dev UI runner
      </Text>
      <Box marginLeft={2} marginTop={1} flexDirection="column">
        <Text color={colors.muted}>Preview individual Ink screens or tour them all.</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>
            <Text color={colors.success} bold>yarn dev:ui</Text>
            <Text color={colors.muted}>{' --phase=<name>      '}</Text>
            <Text dimColor>single phase preview</Text>
          </Text>
          <Text>
            <Text color={colors.success} bold>yarn dev:ui</Text>
            <Text color={colors.muted}>{' --tour [--ms=2500]  '}</Text>
            <Text dimColor>cycle through all phases</Text>
          </Text>
          <Text>
            <Text color={colors.success} bold>yarn dev:cli</Text>
            <Text color={colors.muted}>{' <args>             '}</Text>
            <Text dimColor>run the actual CLI against real packages</Text>
          </Text>
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text bold>Available phases:</Text>
          {PHASES.map((p) => (
            <Text key={p} color={colors.muted}>
              {'  '}·{' '}
              <Text color={colors.accent}>{p}</Text>
            </Text>
          ))}
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text bold>Examples:</Text>
          <Text color={colors.muted}>
            {'  '}yarn dev:ui --phase=diff-review
          </Text>
          <Text color={colors.muted}>
            {'  '}yarn dev:ui --phase=applying
          </Text>
          <Text color={colors.muted}>
            {'  '}yarn dev:ui --tour --ms=1800
          </Text>
          <Text color={colors.muted}>
            {'  '}yarn dev:cli --package @canard/schema-form --scope=project --dry-run
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

interface FixtureViewProps {
  readonly phase: Phase;
  readonly targetCount: number;
}

function FixtureView({ phase, targetCount }: FixtureViewProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Banner version={VERSION} scope="user" />
      <Box marginTop={1}>
        <StepTracker phase={phase} targetCount={targetCount} scope="user" />
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {renderPhaseBody(phase)}
      </Box>
      <Footer phase={phase} version={VERSION} />
    </Box>
  );
}

function renderPhaseBody(phase: Phase): React.ReactNode {
  switch (phase.kind) {
    case 'booting':
    case 'resolving':
      return <Spinner label="resolving targets…" />;
    case 'scope-select':
      return <ScopePicker onSelect={phase.pending} />;
    case 'planning':
      return (
        <Box flexDirection="column">
          <Spinner label="building plans…" />
          <Box flexDirection="column" marginLeft={2} marginTop={1}>
            {[...phase.progress.values()].map((step) => (
              <Box key={step.packageName}>
                <Text
                  color={
                    step.status === 'done'
                      ? colors.success
                      : step.status === 'running'
                        ? colors.warn
                        : step.status === 'failed'
                          ? colors.danger
                          : colors.muted
                  }
                  bold={step.status === 'running'}
                >
                  {step.status === 'done'
                    ? icons.check
                    : step.status === 'failed'
                      ? icons.cross
                      : step.status === 'running'
                        ? icons.bulletActive
                        : icons.bulletPending}{' '}
                </Text>
                <Text>{step.packageName}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      );
    case 'diff-review':
      return (
        <Box flexDirection="column">
          {phase.plans.map((tp, idx) => (
            <TargetCard
              key={tp.target.name}
              target={tp.target}
              plan={tp.plan}
              expanded
              highlighted={idx === phase.focusedIndex}
            />
          ))}
        </Box>
      );
    case 'force-confirm':
      return <ConfirmForce warnings={phase.warnings} onAnswer={phase.pending} />;
    case 'applying': {
      const elapsedMs = Math.max(Date.now() - phase.progress.startedAt, 1);
      const rate = phase.progress.done / elapsedMs;
      const remaining = phase.progress.total - phase.progress.done;
      const eta = rate > 0 ? remaining / rate / 1000 : undefined;
      return (
        <Box flexDirection="column">
          <ProgressBar
            done={phase.progress.done}
            total={phase.progress.total}
            etaSeconds={eta}
            label={phase.progress.current}
          />
          <Box flexDirection="column" marginLeft={2} marginTop={1}>
            {phase.plans.map((tp) => (
              <TargetCard
                key={tp.target.name}
                target={tp.target}
                plan={tp.plan}
                expanded={false}
              />
            ))}
          </Box>
        </Box>
      );
    }
    case 'summary':
      return (
        <Box flexDirection="column">
          {phase.plans.map((tp) => (
            <TargetCard
              key={tp.target.name}
              target={tp.target}
              plan={tp.plan}
              expanded={false}
            />
          ))}
          <Summary
            reports={phase.reports}
            exitCode={phase.exitCode}
            dryRun={phase.dryRun}
          />
        </Box>
      );
    case 'error':
      return <ErrorPanel error={phase.error} />;
    default: {
      const _exhaustive: never = phase;
      void _exhaustive;
      return null;
    }
  }
}

function PhaseApp({ phaseKey }: { phaseKey: PhaseKey }): React.ReactElement {
  const { exit } = useApp();
  const phase = buildPhase(phaseKey);
  useInput((input) => {
    if (input === 'q' || input === '') exit();
  });
  return <FixtureView phase={phase} targetCount={3} />;
}

function TourApp({ intervalMs }: { intervalMs: number }): React.ReactElement {
  const { exit } = useApp();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const handle = setInterval(() => {
      setIdx((current) => {
        if (current + 1 >= PHASES.length) {
          setTimeout(() => exit(), 300);
          return current;
        }
        return current + 1;
      });
    }, intervalMs);
    return () => clearInterval(handle);
  }, [intervalMs, exit]);
  useInput((input) => {
    if (input === 'q' || input === '') exit();
    if (input === ' ')
      setIdx((current) =>
        current + 1 >= PHASES.length ? current : current + 1,
      );
  });
  const phaseKey = PHASES[idx];
  const phase = buildPhase(phaseKey);
  return (
    <Box flexDirection="column">
      <Box>
        <Text color={colors.accent} bold>
          [tour {idx + 1}/{PHASES.length}]
        </Text>
        <Text color={colors.muted} dimColor>
          {'  '}
          {phaseKey}  ·  space:next  ·  q/esc:exit
        </Text>
      </Box>
      <FixtureView phase={phase} targetCount={3} />
    </Box>
  );
}

const args = parseArgs(process.argv.slice(2));
if (args.mode === 'usage') {
  render(<Usage />);
} else if (args.mode === 'phase') {
  render(<PhaseApp phaseKey={args.phase!} />);
} else if (args.mode === 'tour') {
  render(<TourApp intervalMs={args.tourMs ?? 2500} />);
}
