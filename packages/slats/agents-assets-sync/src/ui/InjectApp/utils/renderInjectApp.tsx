import { render } from 'ink';

import type { RenderInput } from '../../types/index.js';
import { InjectApp } from '../InjectApp.js';

export async function renderInjectApp(input: RenderInput): Promise<number> {
  let exitCode: 0 | 1 | 2 = 2;
  const instance = render(
    <InjectApp
      {...input}
      onExit={(code) => {
        exitCode = code;
      }}
    />,
    { exitOnCtrlC: true },
  );
  try {
    await instance.waitUntilExit();
    return exitCode;
  } finally {
    instance.unmount();
  }
}
