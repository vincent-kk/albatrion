import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * r5-release, angles CA1 and RG1: the documentation site's install commands and compatibility
 * tables against the published peer ranges of the UI and AJV plugins.
 *
 * The round 2 peer fixes (for example 91ff738f9, round-2 antd5 2) narrowed every UI peer to the
 * major the plugin bundles (`antd ^5.10.0`, `@mui/material ^7.0.0`, ...), and
 * `.changeset/antd5-peer-compatibility.md` explains why: a host UI outside the range makes the
 * plugin use its own copy, which misses the host theme and ConfigProvider. The site pages still
 * tell consumers to run `yarn add antd@>=5.10.0`, `@mui/material@>=7.0.0`, and so on.
 * On 2026-11-20 the npm `latest` tags were antd 6.7.1, @mui/material 9.5.0,
 * @mui/x-date-pickers 9.18.0 and @mui/icons-material 9.5.0, so those commands install a major the
 * plugin's peer range rejects. Static check: documents and manifests only.
 */
const repositoryRoot = resolve(__dirname, '../../../../../..');
const semver = createRequire(__filename)('semver') as {
  subset: (sub: string, sup: string) => boolean;
};

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
          if (peers[name] && !semver.subset(range, peers[name]))
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
    expect(semver.subset('^5.27.0', manifestOf('antd5').peerDependencies.antd)).toBe(true);
    expect(installedRanges('yarn add a@1 \\\n  @b/c@>=2')).toEqual([
      ['a', '1'],
      ['@b/c', '>=2'],
    ]);
  });
});
