import { join } from 'node:path';

import { type Scope, resolveProjectRoot } from '../scope/index.js';
import type { AgentTarget, AgentType } from './type.js';

const CODEX_NO_COMMANDS =
  'codex has no commands directory at either scope; commands are skipped';

/**
 * Narrow an unknown value to a supported agent token.
 *
 * @param value - candidate value, typically a raw CLI flag
 * @returns `true` when the value is `'claude'` or `'codex'`
 */
export function isValidAgent(value: unknown): value is AgentType {
  return value === 'claude' || value === 'codex';
}

/**
 * Resolve where one agent writes its assets at one scope.
 *
 * The project root is resolved once and shared, so selecting both agents in a
 * single run never writes into two different projects. Nothing is created
 * here — the call reads the filesystem only to locate the root.
 *
 * @param agent - agent whose conventions decide the layout
 * @param scope - user or project
 * @param cwd - directory the `project` walk starts from (defaults to `process.cwd()`)
 * @returns every location this agent writes to, plus a line describing them
 */
export function resolveAgentTarget(
  agent: AgentType,
  scope: Scope,
  cwd?: string,
): AgentTarget {
  const { projectRoot, autoLocated } = resolveProjectRoot(scope, cwd);
  const suffix = `(${agent}, ${scope}${autoLocated ? ', auto-located' : ''})`;

  if (agent === 'claude') {
    const root = join(projectRoot, '.claude');
    return {
      agent,
      scope,
      projectRoot,
      directoryRoots: {
        skills: join(root, 'skills'),
        rules: join(root, 'rules'),
        commands: join(root, 'commands'),
      },
      rulesMergeFile: null,
      unsupported: {},
      description: `${root} ${suffix}`,
    };
  }

  // Codex keeps its own home at `<root>/.codex`, but reads project
  // instructions from `AGENTS.md` at the project root itself.
  const home = join(projectRoot, '.codex');
  const rulesMergeFile =
    scope === 'user' ? join(home, 'AGENTS.md') : join(projectRoot, 'AGENTS.md');
  return {
    agent,
    scope,
    projectRoot,
    directoryRoots: {
      skills: join(home, 'skills'),
      rules: null,
      commands: null,
    },
    rulesMergeFile,
    unsupported: { commands: CODEX_NO_COMMANDS },
    description: `${join(home, 'skills')} + ${rulesMergeFile} ${suffix}`,
  };
}
