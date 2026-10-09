import os from 'node:os';
import path from 'node:path';

/**
 * Node binary for every timing run from round 131 on, pinned through nvm so a Homebrew upgrade cannot replace it
 * mid-session (session 131c). Runs before round 131 used `/opt/homebrew/bin/node` v26.10.0.
 */
export const measurementNode131 = path.join(os.homedir(), '.nvm/versions/node/v26.11.1/bin/node');

/** Node version that `measurementNode131` must report; sessions pass the same value as `--node-version`. */
export const measurementNodeVersion131 = 'v26.11.1';
