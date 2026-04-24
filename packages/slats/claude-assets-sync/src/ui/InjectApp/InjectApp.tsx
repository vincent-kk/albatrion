import { Box, Text } from 'ink';
import { useCallback } from 'react';

import { VERSION } from '@/claude-assets-sync/utils/version.js';

import { Banner } from '../components/Banner.js';
import { ConfirmForce } from '../components/ConfirmForce.js';
import { ErrorPanel } from '../components/ErrorPanel.js';
import { Footer } from '../components/Footer.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { ScopePicker } from '../components/ScopePicker.js';
import { Spinner } from '../components/Spinner.js';
import { StepTracker } from '../components/StepTracker.js';
import { Summary } from '../components/Summary.js';
import { TargetCard } from '../components/TargetCard.js';
import { useExitApp } from '../hooks/useExitApp.js';
import { useInjectSession } from '../hooks/useInjectSession.js';
import { usePhase } from '../hooks/usePhase.js';
import { colors } from '../theme/colors.js';
import { icons } from '../theme/icons.js';
import type { Phase } from '../types/index.js';
import { etaSeconds, scopeLabel } from './utils/eventSelectors.js';
import type { InjectAppProps } from './utils/type.js';

export function InjectApp(props: InjectAppProps): React.ReactElement {
  const { targets, flags, originCwd, onExit } = props;
  const [phase, dispatch] = usePhase({ kind: 'resolving', targets });

  useInjectSession({ targets, flags, originCwd, dispatch });

  const handleExit = useCallback(
    (code: 0 | 1 | 2) => {
      onExit(code);
    },
    [onExit],
  );

  useExitApp({
    enabled: phase.kind === 'summary',
    exitCode: phase.kind === 'summary' ? phase.exitCode : 0,
    onExit: handleExit,
    delayMs: 100,
  });

  useExitApp({
    enabled: phase.kind === 'error',
    exitCode: 1,
    onExit: handleExit,
    delayMs: 100,
  });

  return (
    <Box flexDirection="column">
      <Banner version={VERSION} scope={scopeLabel(phase)} />
      <Box marginTop={1}>
        <StepTracker
          phase={phase}
          targetCount={targets.length}
          scope={scopeLabel(phase)}
        />
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
                {step.error ? (
                  <Text color={colors.danger} dimColor>
                    {'  '}({step.error})
                  </Text>
                ) : null}
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
          <Box marginTop={1}>
            <Text color={colors.muted} dimColor>
              Applying {phase.plans.length} plan(s)…
            </Text>
          </Box>
        </Box>
      );
    case 'force-confirm':
      return (
        <ConfirmForce warnings={phase.warnings} onAnswer={phase.pending} />
      );
    case 'applying': {
      const eta = etaSeconds(
        phase.progress.startedAt,
        phase.progress.done,
        phase.progress.total,
      );
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
