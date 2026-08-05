import { join } from 'node:path';

import { type Scope, resolveProjectRoot } from '../scope/index.js';
import type { AgentTarget, AgentType } from './type.js';

const AGENTS: readonly AgentType[] = ['claude', 'codex', 'agents'];

const NO_COMMANDS =
  'this agent has no commands directory at either scope; commands are skipped';

/** Vendor-neutral home used by the project layout, and by the `agents` agent. */
const NEUTRAL_DIR = '.agents';

/**
 * Narrow an unknown value to a supported agent token.
 *
 * @param value - candidate value, typically a raw CLI flag
 * @returns `true` when the value names an agent this tool can write for
 */
export function isValidAgent(value: unknown): value is AgentType {
  return AGENTS.includes(value as AgentType);
}

/**
 * Resolve where one agent writes its assets at one scope.
 *
 * The project root is resolved once and shared, so selecting several agents
 * in a single run never writes into two different projects. Nothing is
 * created here — the call reads the filesystem only to locate the root.
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

  // At `project` scope both agents share the `.agents` convention and the
  // repository's own AGENTS.md. They diverge only at `user` scope, where
  // codex reads its own home and `agents` reads the neutral one.
  const home = join(projectRoot, agent === 'codex' ? '.codex' : NEUTRAL_DIR);
  const skillsRoot =
    scope === 'user'
      ? join(home, 'skills')
      : join(projectRoot, NEUTRAL_DIR, 'skills');
  const rulesMergeFile =
    scope === 'user' ? join(home, 'AGENTS.md') : join(projectRoot, 'AGENTS.md');

  return {
    agent,
    scope,
    projectRoot,
    directoryRoots: { skills: skillsRoot, rules: null, commands: null },
    rulesMergeFile,
    unsupported: { commands: NO_COMMANDS },
    description: `${skillsRoot} + ${rulesMergeFile} ${suffix}`,
  };
}
