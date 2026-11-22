import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import * as LocalAntd from 'antd';
import { afterEach, expect, it } from 'vitest';

import { Form, registerPlugin } from '@canard/schema-form';

import { plugin } from '../../index';

const packageJson = createRequire(import.meta.url)('../../../package.json');
const semver = createRequire(import.meta.url)('semver');
// The repository root resolves antd the way a host application with antd 6 would.
const hostRequire = createRequire(resolve(__dirname, '../../../../../../package.json'));
const HostAntd = hostRequire('antd');

afterEach(() => {
  cleanup();
  registerPlugin(null);
});

it('every peer range admits only versions the bundled dependency range also accepts', () => {
  const widened = Object.entries(
    packageJson.peerDependencies as Record<string, string>,
  )
    .filter(([name]) => packageJson.dependencies?.[name])
    .filter(
      ([name, peer]) => !semver.subset(peer, packageJson.dependencies[name]),
    )
    .map(([name, peer]) => `${name}: peer ${peer} vs dependency ${packageJson.dependencies[name]}`);
  expect(widened).toEqual([]);
});

it('a host antd release that satisfies the declared peer range configures the plugin inputs', () => {
  expect(semver.satisfies(HostAntd.version, packageJson.peerDependencies.antd)).toBe(true);
  registerPlugin(plugin);
  const schema = {
    type: 'object',
    properties: { name: { type: 'string' } },
  } as const;

  const local = render(
    <LocalAntd.ConfigProvider prefixCls="hostcfg">
      <Form jsonSchema={schema} />
    </LocalAntd.ConfigProvider>,
  );
  const localInput = local.container.querySelector('input')!;
  expect(localInput.className).toContain('hostcfg-input');
  cleanup();

  const host = render(
    <HostAntd.ConfigProvider prefixCls="hostcfg">
      <Form jsonSchema={schema} />
    </HostAntd.ConfigProvider>,
  );
  const hostInput = host.container.querySelector('input')!;
  expect({ host: HostAntd.version, plugin: LocalAntd.version, configured: hostInput.className.includes('hostcfg-input') }).toEqual({
    host: HostAntd.version,
    plugin: LocalAntd.version,
    configured: true,
  });
});
