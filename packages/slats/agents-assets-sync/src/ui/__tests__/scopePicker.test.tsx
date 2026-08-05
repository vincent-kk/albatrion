import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

import { ScopePicker } from '../components/ScopePicker.js';

/** `ink-select-input`'s default indicator, drawn on the highlighted row only. */
const CURSOR = '❯';

function lineFor(frame: string, label: string): string {
  return frame.split('\n').find((line) => line.includes(label)) ?? '';
}

describe('AC-UI-SCOPE-DEFAULT — ScopePicker opens on project', () => {
  it('draws the cursor on the project row, not the user row', () => {
    const { lastFrame } = render(<ScopePicker onSelect={() => {}} />);
    const frame = lastFrame() ?? '';

    expect(lineFor(frame, 'project')).toContain(CURSOR);
    expect(lineFor(frame, 'user')).not.toContain(CURSOR);
  });

  it('confirms project when enter arrives with no arrow key before it', async () => {
    const onSelect = vi.fn();
    const { stdin } = render(<ScopePicker onSelect={onSelect} />);

    stdin.write('\r');
    await Promise.resolve();

    expect(onSelect).toHaveBeenCalledWith('project');
  });
});
