import { realpathSync } from 'node:fs';

import { render } from 'ink-testing-library';
import { expect, vi } from 'vitest';

import * as views from '../../../commands/runCli/renderers/renderOrFallback.js';
import * as core from '../../../core/index.js';
import type { RunResult } from '../../../core/index.js';
import { runCli } from '../../../index.js';
import { InjectApp } from '../../../ui/InjectApp/InjectApp.js';
import * as ui from '../../../ui/index.js';

/** Observe the public CLI and real renderer without silencing or replacing its result. */
export async function runObservedSurface(
  mode: 'plain' | 'json' | 'ink',
  root: string,
  args: readonly string[],
) {
  let stdout = '';
  let stderr = '';
  let frame = '';
  let model: RunResult | undefined;
  const codes: number[] = [];
  const signal = new Error('captured exit');
  const originalRun = core.runInjection;
  const originalView = views.renderOrFallback;
  const tty = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
  Object.defineProperty(process.stdout, 'isTTY', {
    value: mode === 'ink',
    configurable: true,
  });
  vi.spyOn(core, 'runInjection').mockImplementation(async (input) => {
    model = await originalRun(input);
    return model;
  });
  vi.spyOn(views, 'renderOrFallback').mockImplementation(async (...values) => {
    model = values[5] ?? model;
    return originalView(...values);
  });
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += String(chunk);
    return true;
  });
  vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    stderr += String(chunk);
    return true;
  });
  vi.spyOn(console, 'log').mockImplementation((...values) => {
    stdout += values.join(' ') + '\n';
  });
  vi.spyOn(console, 'warn').mockImplementation((...values) => {
    stderr += values.join(' ') + '\n';
  });
  vi.spyOn(console, 'error').mockImplementation((...values) => {
    stderr += values.join(' ') + '\n';
  });
  vi.spyOn(process, 'exit').mockImplementation((value) => {
    codes.push(Number(value ?? 0));
    throw signal;
  });
  vi.spyOn(ui, 'renderInjectApp').mockImplementation(
    (input) =>
      new Promise((resolve, reject) => {
        const app = render(
          <InjectApp
            {...input}
            onExit={(value) => {
              clearTimeout(timer);
              frame = app.lastFrame() ?? '';
              app.unmount();
              resolve(value);
            }}
          />,
        );
        const timer = setTimeout(() => {
          app.unmount();
          reject(new Error('terminal timeout'));
        }, 4000);
      }),
  );
  try {
    try {
      await runCli([
        'node',
        'inject-agents-settings',
        ...args,
        `--root=${root}`,
        '--agent=claude',
        '--scope=project',
        '--yes',
        ...(mode === 'json'
          ? ['--json']
          : mode === 'plain'
            ? ['--no-interactive']
            : []),
      ]);
    } catch (error) {
      if (error !== signal) throw error;
    }
    if (!model) throw new Error('No final result was observed');
    const code = codes[0] ?? 0;
    expect(code).toBe(model.exitCode);
    if (mode === 'ink') expect(frame).not.toBe('');
    if (mode === 'json') expect(JSON.parse(stdout).exitCode).toBe(code);
    const transcript = mode === 'ink' ? frame : stdout + stderr;
    for (const failure of model.failures ?? []) {
      for (const value of [failure.path, failure.reason])
        expect(transcript.replace(/\s/g, '')).toContain(
          value.replace(/\s/g, ''),
        );
    }
    const normalized: RunResult = JSON.parse(
      JSON.stringify(model)
        .split(realpathSync(root))
        .join('<root>')
        .split(root)
        .join('<root>'),
    );
    return { code, model: normalized };
  } finally {
    if (tty) Object.defineProperty(process.stdout, 'isTTY', tty);
    else Reflect.deleteProperty(process.stdout, 'isTTY');
    vi.restoreAllMocks();
  }
}
