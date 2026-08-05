import { useEffect } from 'react';

import type { ConsumerPackage } from '../../commands/runCli/type.js';
import type { Scope } from '../../core/index.js';
import type { InjectEvent } from '../types/index.js';

interface UseResolveStepOptions {
  readonly targets: readonly ConsumerPackage[];
  readonly flags: { readonly scope?: string };
  readonly dispatch: (event: InjectEvent) => void;
  readonly onScopeResolved: (scope: Scope) => void;
}

/**
 * Ink path is guaranteed TTY by `renderOrFallback`, so interactive
 * scope selection is always safe. Non-TTY invocations go through
 * `renderPlain` + `resolveScopeFlag` which exits 2 on missing scope.
 */
export function useResolveStep({
  targets,
  flags,
  dispatch,
  onScopeResolved,
}: UseResolveStepOptions): void {
  useEffect(() => {
    if (flags.scope === 'user' || flags.scope === 'project') {
      const resolved = flags.scope as Scope;
      dispatch({ type: 'scope-selected', scope: resolved });
      dispatch({ type: 'planning-started', targets, scope: resolved });
      onScopeResolved(resolved);
      return;
    }
    const pending = (scope: Scope) => {
      dispatch({ type: 'scope-selected', scope });
      dispatch({ type: 'planning-started', targets, scope });
      onScopeResolved(scope);
    };
    dispatch({ type: 'scope-needed', pending });
  }, [targets, flags.scope, dispatch, onScopeResolved]);
}
