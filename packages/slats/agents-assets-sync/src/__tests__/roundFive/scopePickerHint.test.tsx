import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, expect, it } from 'vitest';

import { makeRoot, removeRoot } from '../../__tests__/roundThree/fixture.js';
import { resolveProjectRoot } from '../../index.js';
import { ScopePicker } from '../../ui/components/ScopePicker.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

it('the project row of the scope picker describes the root the CLI actually picks', () => {
  // A workspace member with its own .claude inside a repository (.git).
  const root = makeRoot('r5-scope-hint');
  roots.push(root);
  const member = join(root, 'apps/web');
  mkdirSync(join(member, '.claude'), { recursive: true });
  const picked = resolveProjectRoot('project', member).projectRoot;

  const app = render(<ScopePicker onSelect={() => {}} />);
  const frame = app.lastFrame() ?? '';
  app.unmount();
  const projectRow = frame.split('\n').find((line) => line.includes('project')) ?? '';

  expect({
    pickedIsRepositoryRoot: picked.endsWith(root.split('/').pop() ?? ''),
    hintPromisesNearestClaude: /nearest ancestor \.claude/.test(projectRow),
  }).toEqual({ pickedIsRepositoryRoot: true, hintPromisesNearestClaude: false });
});
