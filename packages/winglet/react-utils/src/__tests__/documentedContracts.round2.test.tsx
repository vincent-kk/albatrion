import { forwardRef } from 'react';

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { isReactComponent, remainOnlyReactComponent } from '../index';

const doc = (path: string) =>
  readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
describe('round-2 react-utils documentation', () => {
  it('round-2 react-utils 3: documents the exported forwardRef predicates', () => {
    const Forwarded = forwardRef<HTMLDivElement>((_, ref) => <div ref={ref} />);
    expect(isReactComponent(Forwarded)).toBe(true);
    expect(remainOnlyReactComponent({ Forwarded })).toEqual({ Forwarded });
    expect(doc('docs/en/SPECIFICATION.md')).not.toContain(
      '**Does not detect**: `React.forwardRef`',
    );
    expect(doc('docs/agents/skills/react-utils-skill/SKILL.md')).not.toContain(
      'does not detect `forwardRef`',
    );
  });
  it('round-2 react-utils 4: describes stable children updates', () => {
    expect(
      doc('docs/agents/skills/react-utils-skill/knowledge/portal-system.md'),
    ).not.toContain('**Content remounts on re-registration.**');
  });
  it('round-2 react-utils 5: declares the JSX runtime peer floor', () => {
    const manifest = JSON.parse(doc('package.json'));
    expect(manifest.peerDependencies.react).toBe('>=16.14 <20');
    expect(manifest.peerDependencies['react-dom']).toBe('>=16.14 <20');
  });
});
