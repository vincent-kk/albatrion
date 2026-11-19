import { readFileSync } from 'node:fs';
import { subset } from 'semver';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(__dirname, '../../../../..');
const PLUGINS = ['antd5', 'antd6', 'antd-mobile', 'mui'] as const;
const manifestOf = (plugin: string) =>
  JSON.parse(
    readFileSync(
      join(repositoryRoot, `packages/canard/schema-form-${plugin}-plugin/package.json`),
      'utf8',
    ),
  ) as { peerDependencies: Record<string, string> };
const sitePages = (plugin: string) => [
  `documents/docs/canard/schema-form-${plugin}-plugin/index.mdx`,
  `documents/i18n/ko/docusaurus-plugin-content-docs/current/canard/schema-form-${plugin}-plugin/index.mdx`,
];

/** `name@range` tokens of every `yarn add` command, continued lines included. */
const installedRanges = (text: string) => {
  const found: Array<[name: string, range: string]> = [];
  for (const command of text.matchAll(/yarn add ((?:[^\n]*\\\n)*[^\n]*)/g))
    for (const token of command[1].replace(/\\\n/g, ' ').split(/\s+/)) {
      const match = /^(@?[^@\s]+)@(.+)$/.exec(token);
      if (match) found.push([match[1], match[2]]);
    }
  return found;
};

describe('r5-release documented UI peer ranges', () => {
  it('every `yarn add name@range` on the plugin site pages stays inside the plugin peer range', () => {
    const outside: string[] = [];
    for (const plugin of PLUGINS) {
      const peers = manifestOf(plugin).peerDependencies;
      for (const page of sitePages(plugin)) {
        const text = readFileSync(join(repositoryRoot, page), 'utf8');
        for (const [name, range] of installedRanges(text))
          if (peers[name] && !subset(range, peers[name]))
            outside.push(`${plugin}: ${name}@${range} (peer ${peers[name]})`);
      }
    }
    expect(outside).toEqual([]);
  });

  it('the quick-start compatibility table states the published UI peer ranges', () => {
    const table = readFileSync(
      join(repositoryRoot, 'documents/docs/canard/schema-form/quick-start.mdx'),
      'utf8',
    );
    const row = (label: string) =>
      table.split('\n').find((line) => line.startsWith(`| ${label} |`)) ?? '';
    const stated = {
      antd5: /antd `([^`]+)`/.exec(row('antd5'))?.[1],
      antd6: /antd `([^`]+)`/.exec(row('antd6'))?.[1],
      mui: /Material \/ icons `([^`]+)`/.exec(row('MUI'))?.[1],
      muiPickers: /X date pickers `([^`]+)`/.exec(row('MUI'))?.[1],
    };
    expect(stated).toEqual({
      antd5: manifestOf('antd5').peerDependencies.antd,
      antd6: manifestOf('antd6').peerDependencies.antd,
      mui: manifestOf('mui').peerDependencies['@mui/material'],
      muiPickers: manifestOf('mui').peerDependencies['@mui/x-date-pickers'],
    });
  });

  it('the quick-start table does not deny the AJV plugins their published core peer', () => {
    const table = readFileSync(
      join(repositoryRoot, 'documents/docs/canard/schema-form/quick-start.mdx'),
      'utf8',
    );
    const ajvPeers = ['ajv6', 'ajv7', 'ajv8'].map(
      (plugin) => manifestOf(plugin).peerDependencies['@canard/schema-form'],
    );
    expect(ajvPeers.every(Boolean)).toBe(true);
    expect(table).not.toMatch(/AJV 6 \/ 7 \/ 8 plugins \|[^\n]*no core peer declaration/);
  });

  it('control: an in-range command passes the subset check', () => {
    expect(subset('^5.27.0', manifestOf('antd5').peerDependencies.antd)).toBe(true);
    expect(installedRanges('yarn add a@1 \\\n  @b/c@>=2')).toEqual([
      ['a', '1'],
      ['@b/c', '>=2'],
    ]);
  });
});
