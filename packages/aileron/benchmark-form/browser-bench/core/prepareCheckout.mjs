// Loaded by workflow Node steps; its sole argument selects the checkout to build.
import { resolve } from 'node:path';

import { buildCoreCheckout } from './helpers/buildCoreCheckout.ts';

buildCoreCheckout(resolve(process.argv[2] ?? '.'));
