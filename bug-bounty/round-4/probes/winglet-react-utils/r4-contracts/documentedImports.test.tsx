import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { withErrorBoundary } from '../../hoc';

const packageDir = resolve(__dirname, '../../..');
const repositoryRoot = resolve(packageDir, '../../..');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

/** Every named import of a react-utils address inside the fenced code of a document. */
const documentedImports = (file: string) => {
  const text = readFileSync(file, 'utf8');
  const found: Array<{ subpath: string; names: string[] }> = [];
  for (const block of text.matchAll(/```[^\n]*\n([\s\S]*?)```/g))
    for (const statement of block[1].matchAll(
      /import\s*\{([^}]*)\}\s*from\s*'@winglet\/react-utils(\/[^']+)?'/g,
    ))
      found.push({
        subpath: '.' + (statement[2] ?? ''),
        names: statement[1]
          .split(',')
          .map((name) => name.trim())
          .filter((name) => name && !name.startsWith('type ')),
      });
  return found;
};

/** Value names a document imports that the source entry of the subpath does not export at run time. */
const missingNames = async (file: string) => {
  const missing: string[] = [];
  for (const { subpath, names } of documentedImports(file)) {
    const entry = await import(join(packageDir, manifest.exports[subpath].source));
    for (const name of names) if (!(name in entry)) missing.push(`${subpath}:${name}`);
  }
  return missing;
};

describe('r4-contracts react-utils documented imports', () => {
  it('every value the English README imports is exported by its subpath', async () => {
    expect(await missingNames(join(packageDir, 'README.md'))).toEqual([]);
  });

  it('every value the Korean README imports is exported by its subpath', async () => {
    expect(await missingNames(join(packageDir, 'README-ko_kr.md'))).toEqual([]);
  });

  it('every value the documentation site page imports is exported by its subpath', async () => {
    const page = join(repositoryRoot, 'documents/docs/winglet/react-utils/index.mdx');
    expect(await missingNames(page)).toEqual([]);
  });

  it('the site example withErrorBoundary(Widget, { fallback }) shows the fallback when Widget throws', () => {
    const Widget = () => {
      throw new Error('widget failed');
    };
    // Literal call from documents/docs/winglet/react-utils/index.mdx.
    const SafeWidget = withErrorBoundary(Widget, {
      fallback: <p>Something went wrong.</p>,
    } as never);
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    let outcome: string;
    try {
      const { container } = render(<SafeWidget />);
      outcome = container.textContent ?? '';
    } catch (error) {
      outcome = `threw: ${(error as Error).message.slice(0, 60)}`;
    } finally {
      silence.mockRestore();
    }
    expect(outcome).toBe('Something went wrong.');
  });

  it('control: withErrorBoundary(Widget, fallback) shows the fallback', () => {
    const Widget = () => {
      throw new Error('widget failed');
    };
    const SafeWidget = withErrorBoundary(Widget, <p>Something went wrong.</p>);
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<SafeWidget />);
    silence.mockRestore();
    expect(container.textContent).toBe('Something went wrong.');
  });
});
