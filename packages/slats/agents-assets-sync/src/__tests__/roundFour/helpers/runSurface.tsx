import { realpathSync } from 'node:fs';

import { render } from 'ink-testing-library';
import { expect, vi } from 'vitest';

import { renderOrFallback } from '../../../commands/runCli/renderers/renderOrFallback.js';
import * as core from '../../../core/index.js';
import type { RunResult } from '../../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../../types/index.js';
import { InjectApp } from '../../../ui/InjectApp/InjectApp.js';
import * as ui from '../../../ui/index.js';
import { runCliCode } from '../../roundThree/fixture.js';
import { readWrittenFiles } from './readWrittenFiles.js';

/** Run a real surface, observing the core result without changing it. */
export async function runSurface(
  mode: 'plain' | 'json' | 'ink',
  root: string,
  targets: ConsumerPackage[],
  flags: DefaultFlags,
  choices: boolean | 'decline' = false,
  packageArgs?: string[],
  onOutput?: (output: {
    stdout: string;
    stderr: string;
    frame: string;
  }) => void,
) {
  let stdout = '';
  let stderr = '';
  let frame = '';
  const recordOut = (chunk: string | Uint8Array) => {
    stdout += String(chunk);
    return true;
  };
  const recordError = (chunk: string | Uint8Array) => {
    stderr += String(chunk);
    return true;
  };
  const original = core.runInjection;
  let model: RunResult | undefined;
  vi.spyOn(core, 'runInjection').mockImplementation(async (input) => {
    model = await original(input);
    return model;
  });
  vi.spyOn(console, 'log').mockImplementation((...values) => {
    recordOut(values.join(' ') + '\n');
  });
  vi.spyOn(console, 'warn').mockImplementation((...values) => {
    recordError(values.join(' ') + '\n');
  });
  vi.spyOn(console, 'error').mockImplementation((...values) => {
    recordError(values.join(' ') + '\n');
  });
  let code: number;
  if (packageArgs) {
    vi.spyOn(process.stdout, 'write').mockImplementation(recordOut);
    const tty = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
    Object.defineProperty(process.stdout, 'isTTY', {
      value: mode === 'ink',
      configurable: true,
    });
    vi.spyOn(ui, 'renderInjectApp').mockImplementation(
      (input) =>
        new Promise<number>((resolve, reject) => {
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
      code = await runCliCode([
        ...packageArgs,
        '--agent=claude',
        '--scope=project',
        '--yes',
        `--root=${root}`,
        ...(mode === 'json' ? ['--json'] : []),
        ...(mode === 'plain' ? ['--no-interactive'] : []),
      ]);
    } finally {
      if (tty) Object.defineProperty(process.stdout, 'isTTY', tty);
      else Reflect.deleteProperty(process.stdout, 'isTTY');
    }
  } else if (mode !== 'ink') {
    vi.spyOn(process.stdout, 'write').mockImplementation(recordOut);
    vi.spyOn(process.stderr, 'write').mockImplementation(recordError);
    code = await renderOrFallback(
      targets,
      { ...flags, json: mode === 'json' },
      root,
      [],
      { isTTY: false },
    );
  } else {
    code = await new Promise<number>((resolve, reject) => {
      let interval: ReturnType<typeof setInterval> | undefined;
      const app = render(
        <InjectApp
          targets={targets}
          flags={flags}
          originCwd={root}
          onExit={(value) => {
            clearTimeout(timer);
            clearInterval(interval);
            frame = app.lastFrame() ?? '';
            app.unmount();
            resolve(value);
          }}
        />,
      );
      const timer = setTimeout(() => {
        clearInterval(interval);
        app.unmount();
        reject(new Error('terminal timeout'));
      }, 4000);
      if (choices) {
        let answered = '';
        const answer = () => {
          const frame = app.lastFrame() ?? '';
          if (frame === answered || !app.stdin.listenerCount('readable')) return;
          if (
            frame.includes('Select the target agent') ||
            frame.includes('Select the target scope')
          ) {
            answered = frame;
            app.stdin.write('\r');
          } else if (frame.includes('overwrite') && frame.includes('Yes,')) {
            answered = frame;
            app.stdin.write(choices === 'decline' ? 'n' : 'y');
          }
        };
        interval = setInterval(answer, 20);
      }
    });
  }
  vi.restoreAllMocks();
  expect(model).toBeDefined();
  const normalized = JSON.stringify(model)
    .split(realpathSync(root))
    .join('<root>')
    .split(root)
    .join('<root>');
  onOutput?.({ stdout, stderr, frame });
  const parsedModel: RunResult = JSON.parse(normalized);
  return { code, model: parsedModel, files: readWrittenFiles(root) };
}
