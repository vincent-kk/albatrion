import { select } from '@inquirer/prompts';
import pc from 'picocolors';

import type { Scope } from '../core/scope/index.js';

const CHOICES: { name: string; value: Scope; description: string }[] = [
  {
    name: 'user',
    value: 'user',
    description: '~/.claude (applies globally to every project)',
  },
  {
    name: 'project',
    value: 'project',
    description: 'nearest ancestor .claude (or <cwd>/.claude)',
  },
];

export async function selectScopeAsync(): Promise<Scope> {
  const answer = await select<Scope>({
    message: pc.bold(pc.cyan('Select injection scope:')),
    choices: CHOICES.map((c) => ({
      name: c.name,
      value: c.value,
      description: pc.dim(c.description),
    })),
  });
  return answer;
}
