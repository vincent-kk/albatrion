import { useEffect } from 'react';

import type { Fn } from '@aileron/declare';

import { type AgentType, type Scope, isValidAgent, isValidScope } from '../../core/index.js';
import type { ConsumerPackage } from '../../types/index.js';
import type { InjectEvent } from '../types/index.js';

interface UseResolveStepOptions {
  readonly targets: readonly ConsumerPackage[];
  readonly flags: { readonly agent?: string[]; readonly scope?: string; readonly asset?: string[] };
  readonly dispatch: Fn<[event: InjectEvent]>;
  readonly onResolved: Fn<[agents: readonly AgentType[], scope: Scope]>;
}

/**
 * Ask for whatever the flags did not supply, in order: agents, then scope.
 *
 * The Ink path is guaranteed interactive by `renderOrFallback`, so prompting
 * here is always safe. Non-interactive invocations go through `renderPlain`,
 * where `resolveAgentFlag` and `resolveScopeFlag` exit 2 instead of asking.
 */
export function useResolveStep({
  targets,
  flags,
  dispatch,
  onResolved,
}: UseResolveStepOptions): void {
  useEffect(() => {
    const invalidAgent = flags.agent?.find((value) => !isValidAgent(value));
    const invalidAsset = flags.asset?.find((value) => !['skills', 'rules', 'commands'].includes(value));
    const invalidScope = flags.scope !== undefined && !isValidScope(flags.scope);
    if (invalidAgent || invalidAsset || invalidScope) {
      dispatch({ type: 'fail', exitCode: 2, error: new Error(
        `Invalid flag: ${invalidAgent ?? invalidAsset ?? flags.scope}`) });
      return;
    }
    const preselected = (flags.agent ?? []).filter(isValidAgent);

    const withAgents = (agents: readonly AgentType[]) => {
      dispatch({ type: 'agent-selected', agents });
      if (flags.scope === 'user' || flags.scope === 'project') {
        const scope: Scope = flags.scope;
        dispatch({ type: 'scope-selected', scope });
        dispatch({ type: 'planning-started', targets, agents, scope });
        onResolved(agents, scope);
        return;
      }
      dispatch({
        type: 'scope-needed',
        agents,
        pending: (scope: Scope) => {
          dispatch({ type: 'scope-selected', scope });
          dispatch({ type: 'planning-started', targets, agents, scope });
          onResolved(agents, scope);
        },
      });
    };

    if (preselected.length > 0) {
      withAgents(preselected);
      return;
    }
    dispatch({ type: 'agent-needed', pending: withAgents });
  }, [targets, flags.agent, flags.scope, flags.asset, dispatch, onResolved]);
}
