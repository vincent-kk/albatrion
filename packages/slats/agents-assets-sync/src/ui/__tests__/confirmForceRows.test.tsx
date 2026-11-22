import { render } from 'ink-testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConfirmForce } from '../components/ConfirmForce.js';
import type { Warning } from '../types/index.js';

function diverged(agent: Warning['agent']): Warning {
  return {
    packageName: '@slats-test/rows',
    agent,
    kind: 'warn-diverged',
    relPath: 'skills/rows/SKILL.md',
    description: '',
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AC-UI-FORCE-CONFIRM — one row per (package, agent) path', () => {
  it('lists the same path diverged under two agents as two rows', () => {
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(' '));
    });
    const { lastFrame, unmount } = render(
      <ConfirmForce
        warnings={[diverged('claude'), diverged('codex')]}
        onAnswer={() => {}}
      />,
    );
    const frame = lastFrame() ?? '';
    unmount();

    expect(errors.filter((error) => error.includes('same key'))).toEqual([]);
    expect(frame.split('skills/rows/SKILL.md')).toHaveLength(3);
  });
});
