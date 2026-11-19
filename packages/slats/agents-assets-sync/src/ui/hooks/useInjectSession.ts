import { useEffect, useRef } from 'react';
import type { Fn } from '@aileron/declare';
import { runInjection, type AgentType, type Scope } from '../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';
import type { InjectEvent } from '../types/index.js';

/** Transport core input requests and completed models into the UI reducer.
 * @param options Inputs and the pure display-event sink.
 */
export function useInjectSession({ targets, flags, originCwd, dispatch }: {
  readonly targets: readonly ConsumerPackage[];
  readonly flags: DefaultFlags;
  readonly originCwd: string;
  readonly dispatch: Fn<[event: InjectEvent]>;
}): void {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runInjection({
      targets, flags, originCwd,
      selectAgents: () => new Promise<readonly AgentType[]>(resolve => dispatch({ type: 'agent-needed', pending: resolve })),
      selectScope: () => new Promise<Scope>(resolve => dispatch({ type: 'scope-needed', agents: [], pending: resolve })),
      onPlan: (units, values) => {
        dispatch({ type: 'planning-started', targets, agents: values.agents, scope: values.scope });
        dispatch({ type: 'plans-ready', plans: units });
      },
      confirm: units => new Promise<boolean>(resolve => dispatch({
        type: 'force-confirm-required',
        warnings: units.flatMap(unit => unit.plan.actions.flatMap(action =>
          action.kind === 'warn-diverged' || action.kind === 'warn-orphan' || action.kind === 'delete'
            ? [{ packageName: unit.target.name, agent: unit.agentTarget.agent, kind: action.kind === 'warn-diverged' ? 'warn-diverged' : 'warn-orphan', relPath: action.relPath, description: action.kind === 'warn-diverged' ? 'local differs from source (user edit or version change)' : 'exists locally but not in manifest' }] : [])),
        pending: ok => { dispatch({ type: 'force-answer', ok }); resolve(ok); },
      })),
    }).then(result => {
      if (result.errors.length && !result.units.length && result.exitCode !== 0) dispatch({ type: 'fail', error: new Error(result.errors.join('\n')), exitCode: result.exitCode });
      else dispatch({ type: 'done', reports: result.units.flatMap(unit => unit.report ? [unit.report] : []), exitCode: result.exitCode, dryRun: result.dryRun });
    }).catch(error => dispatch({ type: 'fail', error: error instanceof Error ? error : new Error(String(error)) }));
  }, [targets, flags, originCwd, dispatch]);
}
