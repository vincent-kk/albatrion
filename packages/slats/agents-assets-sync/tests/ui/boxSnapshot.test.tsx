import { render } from 'ink-testing-library';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { InjectReport } from '../../src/core/index.js';
import { Banner } from '../../src/ui/components/Banner.js';
import { Summary } from '../../src/ui/components/Summary.js';

describe('Banner visual snapshot', () => {
  it('renders a rounded single-color frame with scope chip', () => {
    const { lastFrame } = render(<Banner version="0.3.0-dev" scope="user" />);
    const output = lastFrame() ?? '';
    expect(output).toMatchSnapshot();
  });

  it('renders without scope when not provided', () => {
    const { lastFrame } = render(<Banner version="0.3.0-dev" />);
    const output = lastFrame() ?? '';
    expect(output).toMatchSnapshot();
  });
});

describe('Summary visual snapshot', () => {
  const reports: InjectReport[] = [
    {
      created: ['a.md', 'b.md', 'c.md'],
      updated: [],
      skipped: ['d.md', 'e.md'],
      warnings: [{ relPath: 'x.md', reason: 'diverged' }],
      deleted: [],
      exitCode: 0,
    },
  ];

  it('renders a double-line box with two-column layout', () => {
    const { lastFrame } = render(
      <Summary reports={reports} exitCode={0} dryRun={false} />,
    );
    const output = lastFrame() ?? '';
    expect(output).toMatchSnapshot();
  });

  it('marks dry-run in the title', () => {
    const { lastFrame } = render(
      <Summary reports={reports} exitCode={0} dryRun />,
    );
    const output = lastFrame() ?? '';
    expect(output).toMatchSnapshot();
  });
});
