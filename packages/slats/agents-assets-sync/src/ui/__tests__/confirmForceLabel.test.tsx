import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import { ConfirmForce } from '../components/ConfirmForce.js';
import type { Warning } from '../types/index.js';

function warning(kind: Warning['kind'], relPath: string): Warning {
  return {
    packageName: '@slats-test/label',
    agent: 'claude',
    kind,
    relPath,
    description: '',
  };
}

function frameFor(warnings: readonly Warning[]): string {
  const { lastFrame, unmount } = render(
    <ConfirmForce warnings={warnings} onAnswer={() => {}} />,
  );
  const frame = lastFrame() ?? '';
  unmount();
  return frame;
}

describe('AC-UI-FORCE-CONFIRM — the accept label names what the run does', () => {
  it('says delete when every path is an orphan', () => {
    const frame = frameFor([
      warning('warn-orphan', 'skills/pp/a.md'),
      warning('warn-orphan', 'skills/pp/b.md'),
    ]);
    expect(frame).toContain('Yes, delete 2 path(s)');
    expect(frame).not.toContain('overwrite');
  });

  it('says overwrite or delete when both kinds are present', () => {
    const frame = frameFor([
      warning('warn-diverged', 'skills/pp/SKILL.md'),
      warning('warn-orphan', 'skills/pp/stale.md'),
    ]);
    expect(frame).toContain('Yes, overwrite or delete 2 path(s)');
  });

  // Control: the label every overwrite-only plan already had.
  it('control: says overwrite when every path diverged', () => {
    const frame = frameFor([warning('warn-diverged', 'skills/pp/SKILL.md')]);
    expect(frame).toContain('Yes, overwrite 1 path(s)');
  });
});
